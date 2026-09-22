<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Services\StripeProductSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeController extends Controller
{
    public function __construct(
        private readonly StripeProductSyncService $stripeProductSyncService,
    )
    {
    }

    public function publicConfig(): JsonResponse
    {
        $publishableKey = (string) config('services.stripe.key');

        return response()->json([
            'configured' => $publishableKey !== '',
            'publishableKey' => $publishableKey,
        ]);
    }

    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.5',
            'currency' => 'nullable|string|size:3',
            'items' => 'nullable|array',
            'items.*.productId' => 'nullable|string|max:255',
            'items.*.name' => 'nullable|string|max:255',
            'items.*.quantity' => 'nullable|integer|min:1|max:999',
        ]);

        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            return response()->json([
                'message' => 'Stripe secret key is not configured.',
            ], 500);
        }

        $amountInCents = (int) round(((float) $validated['amount']) * 100);
        $currency = strtolower((string) ($validated['currency'] ?? 'usd'));

        try {
            Stripe::setApiKey($secretKey);

            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => $this->buildLineItemMetadata($validated['items'] ?? []),
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (ApiErrorException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }

    /**
     * Syncs each purchased product into Stripe's Product catalog and summarizes them as
     * PaymentIntent metadata (Stripe metadata has no native line-item concept).
     */
    private function buildLineItemMetadata(array $items): array
    {
        $metadata = [];

        foreach (array_slice($items, 0, 10) as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $priceId = $this->stripeProductSyncService->syncProductFromItem($item);

            $summary = sprintf(
                '%s x%d',
                (string) ($item['name'] ?? 'Item'),
                (int) ($item['quantity'] ?? 1),
            );

            if ($priceId) {
                $summary .= " ({$priceId})";
            }

            $metadata['item_' . ($index + 1)] = substr($summary, 0, 500);
        }

        return $metadata;
    }
}

