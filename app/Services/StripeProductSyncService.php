<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

/**
 * Mirrors local products into Stripe's Product catalog so checkout/tax calculations
 * reference real Stripe Products/Prices instead of raw amounts.
 */
class StripeProductSyncService
{
    public function isConfigured(): bool
    {
        return (string) config('services.stripe.secret') !== '';
    }

    public function resolveProductFromItem(array $item): ?Product
    {
        $productId = $item['productId'] ?? $item['product_id'] ?? null;

        if ($productId === null || $productId === '') {
            return null;
        }

        return Product::query()->find($productId)
            ?? Product::query()->where('slug', (string) $productId)->first();
    }

    public function syncProductFromItem(array $item): ?string
    {
        $product = $this->resolveProductFromItem($item);

        return $product ? $this->syncProduct($product) : null;
    }

    /**
     * Creates or updates the Stripe Product/Price for a local product and returns the price ID.
     */
    public function syncProduct(Product $product): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        $unitAmount = $this->resolveUnitAmount($product);
        if ($unitAmount <= 0) {
            return null;
        }

        try {
            $stripe = new StripeClient((string) config('services.stripe.secret'));

            $stripeProductId = $product->stripe_product_id;

            if ($stripeProductId) {
                $stripe->products->update($stripeProductId, [
                    'name' => (string) $product->name,
                    'active' => true,
                ]);
            } else {
                $stripeProduct = $stripe->products->create([
                    'name' => (string) $product->name,
                    'metadata' => [
                        'product_id' => (string) $product->id,
                        'sku' => (string) ($product->sku ?? ''),
                    ],
                ]);
                $stripeProductId = $stripeProduct->id;
            }

            $stripePriceId = $product->stripe_price_id;
            $needsNewPrice = true;

            if ($stripePriceId) {
                try {
                    $existingPrice = $stripe->prices->retrieve($stripePriceId, []);
                    $needsNewPrice = ! $existingPrice->active || (int) $existingPrice->unit_amount !== $unitAmount;
                } catch (\Throwable $exception) {
                    $needsNewPrice = true;
                }
            }

            if ($needsNewPrice) {
                if ($stripePriceId) {
                    try {
                        // Stripe prices are immutable - archive the stale one before creating a new one.
                        $stripe->prices->update($stripePriceId, ['active' => false]);
                    } catch (\Throwable $exception) {
                        // Ignore - old price may already be archived.
                    }
                }

                $stripePrice = $stripe->prices->create([
                    'product' => $stripeProductId,
                    'unit_amount' => $unitAmount,
                    'currency' => 'usd',
                ]);
                $stripePriceId = $stripePrice->id;
            }

            if ($product->stripe_product_id !== $stripeProductId || $product->stripe_price_id !== $stripePriceId) {
                $product->forceFill([
                    'stripe_product_id' => $stripeProductId,
                    'stripe_price_id' => $stripePriceId,
                ])->save();
            }

            return $stripePriceId;
        } catch (\Throwable $exception) {
            Log::warning('Failed to sync product to Stripe', [
                'product_id' => $product->id,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    protected function resolveUnitAmount(Product $product): int
    {
        $discountPrice = (float) ($product->discount_price ?? 0);
        $price = $discountPrice > 0 ? $discountPrice : (float) ($product->price ?? 0);

        return (int) round(max(0, $price) * 100);
    }
}
