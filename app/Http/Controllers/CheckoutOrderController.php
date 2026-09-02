<?php

namespace App\Http\Controllers;

use App\Models\CheckoutOrder;
use App\Models\Product;
use App\Services\FacebookConversionsApiService;
use App\Services\ShippingRateService;
use App\Services\VeeqoShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\StripeClient;

class CheckoutOrderController extends Controller
{
    private const PROCESSING_FEE = 0.50;

    private const STRIPE_PERCENT_RATE = 0.029;

    private const STRIPE_FIXED_FEE = 0.30;

    public function __construct(
        private readonly ShippingRateService $shippingRateService,
        private readonly FacebookConversionsApiService $facebookConversionsApiService,
        private readonly VeeqoShippingService $veeqoShippingService,
    )
    {
    }

    public function quoteShipping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address_line_1' => 'required|string|max:255',
            'city' => 'required|string|max:120',
            'state' => 'nullable|string|max:120',
            'postal_code' => 'required|string|max:40',
            'country' => 'nullable|string|max:120',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
        ]);

        if (! $this->veeqoShippingService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping rate service is not configured.',
            ], 422);
        }

        $address = $validated;
        $address['country'] = $this->shippingRateService->normalizeCountryCode($validated['country'] ?? null);

        $items = $this->resolveShippingQuoteItems($validated['items']);

        try {
            $rates = $this->veeqoShippingService->getShippingRates($address, $items);
        } catch (\Throwable $exception) {
            Log::warning('Failed to fetch Veeqo shipping rates', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: 'Unable to calculate shipping rates at the moment.',
                'debug' => config('app.debug') ? $this->veeqoShippingService->getDebugInfo() : null,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'rates' => $rates,
            'debug' => config('app.debug') ? $this->veeqoShippingService->getDebugInfo() : null,
        ]);
    }


    public function quoteTax(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country' => 'required|string|max:120',
            'state' => 'required|string|max:120',
            'city' => 'required|string|max:120',
            'postal_code' => 'required|string|max:40',
            'address_line_1' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.priceValue' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1|max:999',
            'subtotal' => 'required|numeric|min:0',
            'shipping' => 'nullable|numeric|min:0',
        ]);

        try {
            $tax = $this->calculateStripeTax($validated);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to calculate tax at the moment.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        $shipping = (float) ($validated['shipping'] ?? 0);
        $baseTotal = round((float) $validated['subtotal'] + $shipping + $tax, 2);
        $stripeCharge = $this->calculateStripeCharge($baseTotal);
        $total = round($baseTotal + $stripeCharge, 2);

        return response()->json([
            'tax' => $tax,
            'shipping' => $shipping,
            'stripe_charge' => $stripeCharge,
            'processing_fee' => self::PROCESSING_FEE,
            'total' => $total,
        ]);
    }

    protected function customerScopedOrders(Request $request)
    {
        $user = $request->user();

        return CheckoutOrder::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere(function ($subQuery) use ($user) {
                        $subQuery->whereNull('user_id')
                            ->where('email', $user->email);
                    });
            });
    }

    public function index(Request $request): JsonResponse
    {
        $query = CheckoutOrder::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate((int) $request->input('per_page', 20));

        return response()->json($orders);
    }

    public function customerIndex(Request $request): JsonResponse
    {
        $query = $this->customerScopedOrders($request)->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate((int) $request->input('per_page', 20));

        $orders->getCollection()->transform(function (CheckoutOrder $order) {
            $trackingNumber = $this->resolveTrackingNumberForCustomerOrder($order);

            $order->setAttribute('tracking_number', $trackingNumber);

            return $order;
        });

        return response()->json($orders);
    }

    protected function resolveTrackingNumberForCustomerOrder(CheckoutOrder $order): ?string
    {
        $trackingNumber = trim((string) ($order->courier_reference ?? ''));

        return $trackingNumber !== '' ? $trackingNumber : null;
    }

    public function show(CheckoutOrder $checkoutOrder): JsonResponse
    {
        return response()->json($checkoutOrder);
    }

    public function customerShow(Request $request, CheckoutOrder $checkoutOrder): JsonResponse
    {
        $exists = $this->customerScopedOrders($request)
            ->whereKey($checkoutOrder->id)
            ->exists();

        if (! $exists) {
            abort(403, 'Forbidden');
        }

        return response()->json($checkoutOrder);
    }

    public function customerCancel(Request $request, CheckoutOrder $checkoutOrder): JsonResponse
    {
        $ownedOrder = $this->customerScopedOrders($request)
            ->whereKey($checkoutOrder->id)
            ->first();

        if (! $ownedOrder) {
            abort(403, 'Forbidden');
        }

        if (! in_array($ownedOrder->status, ['pending', 'approved', 'processing'], true)) {
            return response()->json([
                'message' => 'Only pending, approved, or processing orders can be cancelled.',
            ], 422);
        }

        $ownedOrder->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $ownedOrder->fresh(),
        ]);
    }

    public function publicShow(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email|max:255',
        ]);

        $orderQuery = CheckoutOrder::query()->where('order_number', $orderNumber);

        $normalizedEmail = strtolower(trim((string) ($validated['email'] ?? '')));
        if ($normalizedEmail !== '') {
            $orderQuery->whereRaw('LOWER(email) = ?', [$normalizedEmail]);
        }

        $order = $orderQuery->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order not found for the provided order number.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $this->formatPublicOrder($order),
        ]);
    }

    public function update(Request $request, CheckoutOrder $checkoutOrder): JsonResponse
    {
        $validated = $request->validate([
            'first_name'      => 'sometimes|required|string|max:100',
            'last_name'       => 'sometimes|required|string|max:100',
            'email'           => 'sometimes|required|email|max:255',
            'phone'           => 'nullable|string|max:50',
            'address_line_1'  => 'sometimes|required|string|max:255',
            'address_line_2'  => 'nullable|string|max:255',
            'city'            => 'sometimes|required|string|max:120',
            'state'           => 'nullable|string|max:120',
            'postal_code'     => 'nullable|string|max:40',
            'country'         => 'nullable|string|max:120',
            'residential'     => 'sometimes|boolean',
            'notes'           => 'nullable|string|max:3000',
            'status'          => 'nullable|string|in:pending,approved,processing,shipped,delivered,cancelled,refunded',
        ]);

        $checkoutOrder->update($validated);

        return response()->json([
            'message' => 'Order updated successfully',
            'order'   => $checkoutOrder->fresh(),
        ]);
    }

    public function destroy(CheckoutOrder $checkoutOrder): JsonResponse
    {
        $checkoutOrder->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer',
            'status' => 'required|string|in:pending,approved,processing,shipped,delivered,cancelled,refunded',
        ]);

        CheckoutOrder::whereIn('id', $validated['ids'])->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Orders updated successfully']);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        CheckoutOrder::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => 'Orders deleted successfully']);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:120',
            'state' => 'nullable|string|max:120',
            'postal_code' => 'nullable|string|max:40',
            'country' => 'nullable|string|max:120',
            'residential' => 'nullable|boolean',
            'notes' => 'nullable|string|max:3000',
            'items' => 'required|array|min:1',
            'items.*.lineId' => 'nullable|string|max:255',
            'items.*.productId' => 'nullable|string|max:255',
            'items.*.name' => 'required|string|max:255',
            'items.*.priceValue' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1|max:999',
            'items.*.weight' => 'nullable',
            'items.*.image' => 'nullable|string|max:2048',
            'items.*.selectedColor' => 'nullable|string|max:100',
            'items.*.selectedSize' => 'nullable|string|max:100',
            'subtotal' => 'required|numeric|min:0',
            'shipping' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'stripe_charge' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_intent_id' => 'required|string|max:255',
            'fb_event_id' => 'nullable|string|max:100',
        ]);

        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            return response()->json([
                'message' => 'Stripe secret key is not configured.',
            ], 500);
        }

        $shipping = round((float) $validated['shipping'], 2);
        $tax = round((float) $validated['tax'], 2);
        $baseTotal = round((float) $validated['subtotal'] + $shipping + $tax, 2);
        $stripeCharge = isset($validated['stripe_charge'])
            ? round((float) $validated['stripe_charge'], 2)
            : $this->calculateStripeCharge($baseTotal);
        $clientTotal = round((float) $validated['total'], 2);
        $expectedAmount = (int) round($clientTotal * 100);

        try {
            $stripe = new StripeClient($secretKey);
            $paymentIntent = $stripe->paymentIntents->retrieve($validated['payment_intent_id'], []);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Unable to verify payment intent.',
            ], 422);
        }

        if (($paymentIntent->status ?? null) !== 'succeeded') {
            return response()->json([
                'message' => 'Payment has not been completed.',
            ], 422);
        }

        $paidAmount = (int) ($paymentIntent->amount ?? 0);
        if (abs($paidAmount - $expectedAmount) > 1) {
            return response()->json([
                'message' => 'Payment amount does not match order total.',
            ], 422);
        }

        $computedTotal = round($paidAmount / 100, 2);
        $stripeCharge = round(max(0, $computedTotal - $baseTotal), 2);

        $orderNumber = sprintf('ORD-%s-%04d', now()->format('YmdHis'), random_int(0, 9999));

        $order = CheckoutOrder::create([
            'user_id' => $request->user()?->id,
            'order_number' => $orderNumber,
            'first_name' => trim($validated['first_name']),
            'last_name' => trim($validated['last_name']),
            'email' => trim($validated['email']),
            'phone' => isset($validated['phone']) ? trim((string) $validated['phone']) : null,
            'address_line_1' => trim($validated['address_line_1']),
            'address_line_2' => isset($validated['address_line_2']) ? trim((string) $validated['address_line_2']) : null,
            'city' => trim($validated['city']),
            'state' => isset($validated['state']) ? trim((string) $validated['state']) : null,
            'postal_code' => isset($validated['postal_code']) ? trim((string) $validated['postal_code']) : null,
            'country' => $this->shippingRateService->normalizeCountryCode($validated['country'] ?? null),
            'residential' => (bool) ($validated['residential'] ?? false),
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'items_count' => collect($validated['items'])->sum('quantity'),
            'subtotal' => $validated['subtotal'],
            'shipping' => $shipping,
            'delivery_cost' => $shipping,
            'state_tax' => $tax,
            'stripe_charge' => $stripeCharge,
            'processing_fee' => self::PROCESSING_FEE,
            'total' => $computedTotal,
            'items' => $validated['items'],
            'status' => 'approved',
            'payment_provider' => 'stripe',
            'payment_status' => 'paid',
            'payment_intent_id' => $validated['payment_intent_id'],
            'courier_service' => 'veeqo',
            'courier_sync_status' => 'pending',
        ]);

        $fbEventId = (string) ($validated['fb_event_id'] ?? '') ?: (string) Str::uuid();
        $this->sendPurchaseConversionEvent($order, $request, $fbEventId);

        return response()->json([
            'message' => 'Order created successfully',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'delivery_cost' => $shipping,
            'tax' => $tax,
            'stripe_charge' => $stripeCharge,
            'processing_fee' => self::PROCESSING_FEE,
            'courier_service' => $order->courier_service,
            'courier_sync_status' => $order->fresh()?->courier_sync_status,
            'fb_event_id' => $fbEventId,
        ], 201);
    }

    private function sendPurchaseConversionEvent(CheckoutOrder $order, Request $request, string $eventId): void
    {
        try {
            $items = is_array($order->items) ? $order->items : [];
            $contents = array_map(static fn ($item) => [
                'id' => (string) ($item['productId'] ?? ''),
                'quantity' => (int) ($item['quantity'] ?? 1),
                'item_price' => (float) ($item['priceValue'] ?? 0),
            ], $items);

            $this->facebookConversionsApiService->sendEvent(
                'Purchase',
                [
                    'email' => $order->email,
                    'phone' => $order->phone,
                    'first_name' => $order->first_name,
                    'last_name' => $order->last_name,
                    'city' => $order->city,
                    'state' => $order->state,
                    'zip' => $order->postal_code,
                    'country' => $order->country,
                    'client_ip_address' => $request->ip(),
                    'client_user_agent' => $request->userAgent(),
                    'fbp' => $request->cookie('_fbp'),
                    'fbc' => $request->cookie('_fbc'),
                ],
                [
                    'currency' => 'USD',
                    'value' => (float) $order->total,
                    'content_type' => 'product',
                    'content_ids' => array_column($contents, 'id'),
                    'contents' => $contents,
                    'num_items' => (int) $order->items_count,
                    'order_id' => $order->order_number,
                ],
                $eventId,
                $request->headers->get('referer'),
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send Facebook Purchase conversion event', [
                'order_number' => $order->order_number,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    protected function calculateStripeCharge(float $baseAmount): float
    {
        $safeAmount = max(0, $baseAmount);
        return round(($safeAmount * self::STRIPE_PERCENT_RATE) + self::STRIPE_FIXED_FEE, 2);
    }

    protected function calculateStripeTax(array $payload): float
    {
        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            throw new \RuntimeException('Stripe secret key is not configured.');
        }

        $items = is_array($payload['items'] ?? null) ? $payload['items'] : [];
        $lineItems = [];

        foreach ($items as $index => $item) {
            $priceValue = (float) ($item['priceValue'] ?? 0);
            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $amount = (int) round(max(0, $priceValue) * 100);

            if ($amount <= 0) {
                continue;
            }

            $lineItems[] = [
                'amount' => $amount,
                'quantity' => $quantity,
                'reference' => 'line-' . ($index + 1),
                'tax_code' => 'txcd_99999999',
            ];
        }

        if ($lineItems === []) {
            return 0.0;
        }

        $country = strtoupper($this->shippingRateService->normalizeCountryCode($payload['country'] ?? null));
        $state = strtoupper(trim((string) ($payload['state'] ?? '')));
        $city = trim((string) ($payload['city'] ?? ''));
        $postalCode = trim((string) ($payload['postal_code'] ?? ''));
        $line1 = trim((string) ($payload['address_line_1'] ?? 'N/A'));
        $shippingAmount = (int) round(max(0, (float) ($payload['shipping'] ?? 0)) * 100);

        $params = [
            'currency' => 'usd',
            'line_items' => $lineItems,
            'customer_details' => [
                'address_source' => 'shipping',
                'address' => [
                    'line1' => $line1,
                    'city' => $city,
                    'state' => $state,
                    'postal_code' => $postalCode,
                    'country' => $country !== '' ? $country : 'US',
                ],
            ],
        ];

        if ($shippingAmount > 0) {
            $params['shipping_cost'] = [
                'amount' => $shippingAmount,
                'tax_code' => 'txcd_92010001',
            ];
        }

        $stripe = new StripeClient($secretKey);
        $calculation = $stripe->tax->calculations->create($params);

        $taxAmount = 0;

        if (isset($calculation->amount_tax)) {
            $taxAmount = (int) $calculation->amount_tax;
        } elseif (isset($calculation->amount_total, $calculation->amount_subtotal)) {
            $taxAmount = (int) $calculation->amount_total - (int) $calculation->amount_subtotal;
        } elseif (isset($calculation->tax_breakdown) && is_array($calculation->tax_breakdown)) {
            foreach ($calculation->tax_breakdown as $row) {
                $taxAmount += (int) ($row->amount ?? 0);
            }
        }

        return round(max(0, $taxAmount) / 100, 2);
    }

    protected function resolveShippingQuoteItems(array $items): array
    {
        if (! is_array($items) || $items === []) {
            return [];
        }

        $resolved = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $resolvedItem = $item;
            $productId = $item['productId'] ?? $item['product_id'] ?? null;
            $product = null;

            if ($productId !== null && $productId !== '') {
                $product = Product::query()->find($productId);

                if (! $product) {
                    $product = Product::query()
                        ->where('slug', (string) $productId)
                        ->first();
                }
            }

            // Prioritize incoming frontend weight if valid, otherwise fallback to database variant weight
            $incomingWeight = $this->normalizeWeightToFloat($item['weight'] ?? null);

            if ($product) {
                $resolvedItem['weight'] = $incomingWeight ?? $this->resolveVariantWeight(
                    $product,
                    $item['selectedColor'] ?? '',
                    $item['selectedSize'] ?? '',
                    $item['sku'] ?? ''
                );
                $resolvedItem['length'] = $resolvedItem['length'] ?? $product->length;
                $resolvedItem['width'] = $resolvedItem['width'] ?? $product->width;
                $resolvedItem['height'] = $resolvedItem['height'] ?? $product->height;
            } else {
                $resolvedItem['weight'] = $incomingWeight;
            }

            $resolved[] = $resolvedItem;
        }

        return $resolved;
    }

    protected function resolveVariantWeight(Product $product, string $selectedColor = '', string $selectedSize = '', string $selectedSku = ''): ?float
    {
        $rows = is_array($product->variant_rows) ? $product->variant_rows : [];
        if ($rows === []) {
            return $this->normalizeWeightToFloat($product->weight ?? null);
        }

        $selectedSku = strtolower(trim((string) $selectedSku));
        $selectedColor = strtolower(trim((string) $selectedColor));
        $selectedSize = strtolower(trim((string) $selectedSize));

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $skuMatch = $selectedSku !== '' && strtolower(trim((string) ($row['sku'] ?? ''))) === $selectedSku;
            if ($skuMatch) {
                return $this->normalizeWeightToFloat($row['weight'] ?? $product->weight ?? null);
            }

            $rowColor = strtolower(trim((string) ($row['color'] ?? '')));
            $rowSize = strtolower(trim((string) ($row['size'] ?? '')));

            if (
                ($selectedColor === '' || $rowColor === $selectedColor || str_contains($rowColor, $selectedColor))
                && ($selectedSize === '' || $rowSize === $selectedSize || str_contains($rowSize, $selectedSize))
            ) {
                $weight = $this->normalizeWeightToFloat($row['weight'] ?? $product->weight ?? null);
                if ($weight !== null) {
                    return $weight;
                }
            }
        }

        return $this->normalizeWeightToFloat($product->weight ?? null);
    }

    protected function estimateWeight(array $items): float
    {
        $quantity = 0;
        $totalWeight = 0.0;
        $hasItemWeight = false;

        foreach ($items as $item) {
            $lineQuantity = max(1, (int) ($item['quantity'] ?? 1));
            $quantity += $lineQuantity;

            $lineWeight = $this->normalizeWeightToFloat($item['weight'] ?? null);
            if ($lineWeight !== null && $lineWeight > 0) {
                $hasItemWeight = true;
                $totalWeight += $lineWeight * $lineQuantity;
            }
        }

        if (! $hasItemWeight) {
            return max(1.0, $quantity * 0.8);
        }

        return max(0.1, round($totalWeight, 3));
    }

    protected function normalizeWeightToFloat($weight): ?float
    {
        if ($weight === null || $weight === '') {
            return null;
        }

        if (is_numeric($weight)) {
            $value = (float) $weight;
            return $value > 0 ? $value : null;
        }

        $raw = trim((string) $weight);
        if ($raw === '') {
            return null;
        }

        if (preg_match('/-?\d+(?:\.\d+)?/', $raw, $matches) === 1) {
            $value = (float) $matches[0];
            return $value > 0 ? $value : null;
        }

        return null;
    }

    protected function formatPublicOrder(CheckoutOrder $order): array
    {
        $deliveryCost = (float) ($order->delivery_cost ?? $order->shipping);
        $stateTax = (float) ($order->state_tax ?? 0);
        $stripeCharge = (float) ($order->stripe_charge ?? $order->processing_fee ?? 0);
        $processingFee = (float) ($order->processing_fee ?? 0);

        return [
            'order_number' => (string) $order->order_number,
            'status' => (string) $order->status,
            'first_name' => (string) $order->first_name,
            'last_name' => (string) $order->last_name,
            'email' => (string) $order->email,
            'phone' => $order->phone,
            'address_line_1' => (string) $order->address_line_1,
            'address_line_2' => $order->address_line_2,
            'city' => (string) $order->city,
            'state' => $order->state,
            'postal_code' => $order->postal_code,
            'country' => $order->country,
            'notes' => $order->notes,
            'items_count' => (int) $order->items_count,
            'items' => $order->items,
            'subtotal' => (float) $order->subtotal,
            'shipping' => (float) $order->shipping,
            'delivery_cost' => $deliveryCost,
            'deliveryCost' => $deliveryCost,
            'deliverycost' => $deliveryCost,
            'state_tax' => $stateTax,
            'stateTax' => $stateTax,
            'stripe_charge' => $stripeCharge,
            'stripeCharge' => $stripeCharge,
            'stripecharge' => $stripeCharge,
            'processing_fee' => $processingFee,
            'processingFee' => $processingFee,
            'processingfee' => $processingFee,
            'total' => (float) $order->total,
            'courier_service' => $order->courier_service,
            'courier_reference' => $order->courier_reference,
            'courier_sync_status' => $order->courier_sync_status,
            'courier_sync_error' => $order->courier_sync_error,
            'shipstation_order_id' => $order->shipstation_order_id,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }

    public function externalShow(Request $request, CheckoutOrder $checkoutOrder): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->tokenCan('orders:read-external')) {
            abort(403, 'Unauthorized. Missing required token ability.');
        }

        return response()->json([
            'success' => true,
            'order'   => $checkoutOrder,
        ]);
    }

    public function externalIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->tokenCan('orders:read-external')) {
            abort(403, 'Unauthorized. Missing required token ability.');
        }

        $validated = $request->validate([
            'since_id' => 'nullable|integer|min:0',
            'per_page' => 'nullable|integer|min:1|max:200',
            'status' => 'nullable|string',
        ]);

        $query = CheckoutOrder::query()->orderBy('id');

        if (! empty($validated['since_id'])) {
            $query->where('id', '>', (int) $validated['since_id']);
        }

        if (! empty($validated['status'])) {
            $query->where('status', (string) $validated['status']);
        }

        $orders = $query
            ->limit((int) ($validated['per_page'] ?? 100))
            ->get();

        return response()->json([
            'success' => true,
            'count' => $orders->count(),
            'orders' => $orders->map(fn (CheckoutOrder $order) => $this->formatExternalOrder($order))->values(),
        ]);
    }

    public function publicExternalIndex(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'since_id' => 'nullable|integer|min:0',
            'per_page' => 'nullable|integer|min:1|max:200',
            'status' => 'nullable|string',
        ]);

        $query = CheckoutOrder::query()->orderBy('id');

        if (! empty($validated['since_id'])) {
            $query->where('id', '>', (int) $validated['since_id']);
        }

        if (! empty($validated['status'])) {
            $query->where('status', (string) $validated['status']);
        }

        $orders = $query
            ->limit((int) ($validated['per_page'] ?? 100))
            ->get();

        return response()->json([
            'success' => true,
            'count' => $orders->count(),
            'orders' => $orders->map(fn (CheckoutOrder $order) => $this->formatExternalOrder($order))->values(),
        ]);
    }

    public function publicExternalShow(CheckoutOrder $checkoutOrder): JsonResponse
    {
        return response()->json([
            'success' => true,
            'order' => $this->formatExternalOrder($checkoutOrder),
        ]);
    }

    protected function formatExternalOrder(CheckoutOrder $order): array
    {
        $deliveryCost = (float) ($order->delivery_cost ?? $order->shipping);
        $stateTax = (float) ($order->state_tax ?? 0);
        $stripeCharge = (float) ($order->stripe_charge ?? $order->processing_fee ?? 0);
        $processingFee = (float) ($order->processing_fee ?? 0);

        return [
            'id' => (int) $order->id,
            'order_number' => (string) $order->order_number,
            'status' => (string) $order->status,
            'first_name' => (string) $order->first_name,
            'last_name' => (string) $order->last_name,
            'email' => (string) $order->email,
            'phone' => $order->phone,
            'address_line_1' => (string) $order->address_line_1,
            'address_line_2' => $order->address_line_2,
            'city' => (string) $order->city,
            'state' => $order->state,
            'postal_code' => $order->postal_code,
            'country' => $order->country,
            'notes' => $order->notes,
            'items_count' => (int) $order->items_count,
            'items' => $order->items,
            'subtotal' => (float) $order->subtotal,
            'shipping' => (float) $order->shipping,
            'delivery_cost' => $deliveryCost,
            'deliveryCost' => $deliveryCost,
            'deliverycost' => $deliveryCost,
            'state_tax' => $stateTax,
            'stateTax' => $stateTax,
            'stripe_charge' => $stripeCharge,
            'stripeCharge' => $stripeCharge,
            'stripecharge' => $stripeCharge,
            'processing_fee' => $processingFee,
            'processingFee' => $processingFee,
            'processingfee' => $processingFee,
            'total' => (float) $order->total,
            'courier_service' => $order->courier_service,
            'courier_reference' => $order->courier_reference,
            'courier_sync_status' => $order->courier_sync_status,
            'courier_sync_error' => $order->courier_sync_error,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }
}