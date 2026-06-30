<?php

namespace App\Http\Controllers;

use App\Models\CheckoutOrder;
use App\Services\ShippingRateService;
use App\Services\ShipStationService;
use App\Services\UpsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class CheckoutOrderController extends Controller
{
    public function __construct(
        private readonly ShipStationService $shipStationService,
        private readonly ShippingRateService $shippingRateService,
        private readonly UpsService $upsService,
    )
    {
    }

    public function quoteShipping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courier' => 'required|string|in:ups,shipstation',
            'country' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'city' => 'nullable|string|max:120',
            'postal_code' => 'nullable|string|max:40',
            'items' => 'nullable|array',
            'items.*.quantity' => 'nullable|integer|min:1|max:999',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $shipping = $this->calculateShippingByCourier($validated['courier'], $validated);

        return response()->json([
            'courier' => $validated['courier'],
            'shipping' => $shipping,
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

        return response()->json($orders);
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
        $previousStatus = (string) $checkoutOrder->status;
        $syncWarning = null;

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
            'notes'           => 'nullable|string|max:3000',
            'status'          => 'nullable|string|in:pending,approved,processing,shipped,delivered,cancelled,refunded',
        ]);

        $nextStatus = (string) ($validated['status'] ?? $previousStatus);

        if ($previousStatus === 'approved' && $nextStatus === 'processing') {
            $courier = (string) ($checkoutOrder->courier_service ?? 'shipstation');

            if ($courier === 'ups') {
                try {
                    $upsResponse = $this->upsService->createShipmentForCheckoutOrder($checkoutOrder);
                    $trackingNumber = $this->extractUpsTrackingNumber($upsResponse);

                    $validated['courier_sync_status'] = 'synced';
                    $validated['courier_sync_error'] = null;
                    $validated['courier_reference'] = $trackingNumber;
                    $validated['ups_tracking_number'] = $trackingNumber;
                    $validated['ups_synced_at'] = now();
                } catch (\Throwable $exception) {
                    Log::error('UPS shipment push failed on single order update.', [
                        'checkout_order_id' => $checkoutOrder->id,
                        'order_number' => $checkoutOrder->order_number,
                        'error' => $exception->getMessage(),
                    ]);

                    $validated['courier_sync_status'] = 'failed';
                    $validated['courier_sync_error'] = $exception->getMessage();
                    $syncWarning = 'Order status updated, but UPS sync failed.';
                }
            } else {
                try {
                    $shipStationResponse = $this->shipStationService->createOrderForCheckoutOrder($checkoutOrder);
                    $validated['courier_sync_status'] = 'synced';
                    $validated['courier_sync_error'] = null;
                    $validated['courier_reference'] = $this->extractShipStationOrderId($shipStationResponse);
                    $validated['shipstation_order_id'] = $this->extractShipStationOrderId($shipStationResponse);
                    $validated['shipstation_synced_at'] = now();
                } catch (\Throwable $exception) {
                    Log::error('ShipStation order push failed on single order update.', [
                        'checkout_order_id' => $checkoutOrder->id,
                        'order_number' => $checkoutOrder->order_number,
                        'error' => $exception->getMessage(),
                    ]);

                    $validated['courier_sync_status'] = 'failed';
                    $validated['courier_sync_error'] = $exception->getMessage();
                    $syncWarning = 'Order status updated, but ShipStation sync failed.';
                }
            }
        }

        $checkoutOrder->update($validated);

        return response()->json([
            'message' => $syncWarning ?: 'Order updated successfully',
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

        if ($validated['status'] === 'processing') {
            $ordersToSend = CheckoutOrder::query()
                ->whereIn('id', $validated['ids'])
                ->where('status', 'approved')
                ->get();

            $syncPayloadByOrderId = [];
            $failedSyncs = 0;

            foreach ($ordersToSend as $order) {
                $courier = (string) ($order->courier_service ?? 'shipstation');

                if ($courier === 'ups') {
                    try {
                        $upsResponse = $this->upsService->createShipmentForCheckoutOrder($order);
                        $trackingNumber = $this->extractUpsTrackingNumber($upsResponse);
                        $syncPayloadByOrderId[$order->id] = [
                            'courier_sync_status' => 'synced',
                            'courier_sync_error' => null,
                            'courier_reference' => $trackingNumber,
                            'ups_tracking_number' => $trackingNumber,
                            'ups_synced_at' => now(),
                        ];
                    } catch (\Throwable $exception) {
                        Log::error('UPS shipment push failed on bulk order update.', [
                            'checkout_order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'error' => $exception->getMessage(),
                        ]);

                        $failedSyncs++;
                        $syncPayloadByOrderId[$order->id] = [
                            'courier_sync_status' => 'failed',
                            'courier_sync_error' => $exception->getMessage(),
                        ];
                    }
                } else {
                    try {
                        $shipStationResponse = $this->shipStationService->createOrderForCheckoutOrder($order);
                        $syncPayloadByOrderId[$order->id] = [
                            'courier_sync_status' => 'synced',
                            'courier_sync_error' => null,
                            'courier_reference' => $this->extractShipStationOrderId($shipStationResponse),
                            'shipstation_order_id' => $this->extractShipStationOrderId($shipStationResponse),
                            'shipstation_synced_at' => now(),
                        ];
                    } catch (\Throwable $exception) {
                        Log::error('ShipStation order push failed on bulk order update.', [
                            'checkout_order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'error' => $exception->getMessage(),
                        ]);

                        $failedSyncs++;
                        $syncPayloadByOrderId[$order->id] = [
                            'courier_sync_status' => 'failed',
                            'courier_sync_error' => $exception->getMessage(),
                        ];
                    }
                }
            }

            DB::transaction(function () use ($validated, $syncPayloadByOrderId): void {
                foreach ($validated['ids'] as $orderId) {
                    $updatePayload = ['status' => $validated['status']];

                    if (isset($syncPayloadByOrderId[$orderId])) {
                        $updatePayload = array_merge($updatePayload, $syncPayloadByOrderId[$orderId]);
                    }

                    CheckoutOrder::query()->whereKey($orderId)->update($updatePayload);
                }
            });

            $message = $failedSyncs > 0
                ? 'Orders updated, but ' . $failedSyncs . ' courier sync(s) failed.'
                : 'Orders updated successfully';

            return response()->json(['message' => $message]);
        }

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
            'notes' => 'nullable|string|max:3000',
            'items' => 'required|array|min:1',
            'items.*.lineId' => 'nullable|string|max:255',
            'items.*.productId' => 'nullable|string|max:255',
            'items.*.name' => 'required|string|max:255',
            'items.*.priceValue' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1|max:999',
            'items.*.image' => 'nullable|string|max:2048',
            'items.*.selectedColor' => 'nullable|string|max:100',
            'items.*.selectedSize' => 'nullable|string|max:100',
            'courier' => 'required|string|in:ups,shipstation',
            'subtotal' => 'required|numeric|min:0',
            'shipping' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_intent_id' => 'required|string|max:255',
        ]);

        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            return response()->json([
                'message' => 'Stripe secret key is not configured.',
            ], 500);
        }

        $shipping = $this->calculateShippingByCourier($validated['courier'], $validated);
        $computedTotal = (float) $validated['subtotal'] + $shipping;
        $expectedAmount = (int) round($computedTotal * 100);

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

        if ((int) ($paymentIntent->amount ?? 0) !== $expectedAmount) {
            return response()->json([
                'message' => 'Payment amount does not match order total.',
            ], 422);
        }

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
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'items_count' => collect($validated['items'])->sum('quantity'),
            'subtotal' => $validated['subtotal'],
            'shipping' => $shipping,
            'total' => $computedTotal,
            'items' => $validated['items'],
            'status' => 'approved',
            'payment_provider' => 'stripe',
            'payment_status' => 'paid',
            'payment_intent_id' => $validated['payment_intent_id'],
            'courier_service' => $validated['courier'],
            'courier_sync_status' => 'pending',
        ]);

        if ($validated['courier'] === 'ups') {
            $syncPayload = $this->dispatchOrderToCourier($order);

            if (! empty($syncPayload)) {
                $order->update($syncPayload);
            }
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'courier_service' => $order->courier_service,
            'courier_sync_status' => $order->fresh()?->courier_sync_status,
        ], 201);
    }

    protected function calculateShippingByCourier(string $courier, array $payload): float
    {
        $subtotal = (float) ($payload['subtotal'] ?? 0);
        $fallbackShipping = $this->shippingRateService->calculate([
            'country' => $payload['country'] ?? null,
            'state' => $payload['state'] ?? null,
        ], $subtotal);

        if ($courier === 'ups') {
            $weight = $this->estimateWeight($payload['items'] ?? []);

            if (! $this->upsService->isConfigured()) {
                // Graceful fallback while UPS credentials are not set in local/dev.
                return $fallbackShipping;
            }

            try {
                return $this->upsService->getShipmentCharge([
                    'country' => $payload['country'] ?? null,
                    'state' => $payload['state'] ?? null,
                    'city' => $payload['city'] ?? null,
                    'postal_code' => $payload['postal_code'] ?? null,
                    'weight' => $weight,
                ]);
            } catch (\Throwable $exception) {
                Log::warning('UPS shipping quote failed. Falling back to default shipping rate.', [
                    'error' => $exception->getMessage(),
                    'country' => $payload['country'] ?? null,
                    'state' => $payload['state'] ?? null,
                    'postal_code' => $payload['postal_code'] ?? null,
                ]);

                return $fallbackShipping;
            }
        }

        return $fallbackShipping;
    }

    protected function estimateWeight(array $items): float
    {
        $quantity = 0;

        foreach ($items as $item) {
            $quantity += max(1, (int) ($item['quantity'] ?? 1));
        }

        return max(1.0, $quantity * 0.8);
    }

    protected function dispatchOrderToCourier(CheckoutOrder $order): array
    {
        $courier = (string) ($order->courier_service ?? 'shipstation');

        if ($courier === 'ups') {
            try {
                $response = $this->upsService->createShipmentForCheckoutOrder($order);
                $trackingNumber = $this->extractUpsTrackingNumber($response);

                return [
                    'courier_sync_status' => 'synced',
                    'courier_sync_error' => null,
                    'courier_reference' => $trackingNumber,
                    'ups_tracking_number' => $trackingNumber,
                    'ups_synced_at' => now(),
                ];
            } catch (\Throwable $exception) {
                Log::error('UPS shipment push failed on order create.', [
                    'checkout_order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'error' => $exception->getMessage(),
                ]);

                return [
                    'courier_sync_status' => 'failed',
                    'courier_sync_error' => $exception->getMessage(),
                ];
            }
        }

        try {
            $response = $this->shipStationService->createOrderForCheckoutOrder($order);
            $shipStationOrderId = $this->extractShipStationOrderId($response);

            return [
                'courier_sync_status' => 'synced',
                'courier_sync_error' => null,
                'courier_reference' => $shipStationOrderId,
                'shipstation_order_id' => $shipStationOrderId,
                'shipstation_synced_at' => now(),
            ];
        } catch (\Throwable $exception) {
            Log::error('ShipStation order push failed on order create.', [
                'checkout_order_id' => $order->id,
                'order_number' => $order->order_number,
                'error' => $exception->getMessage(),
            ]);

            return [
                'courier_sync_status' => 'failed',
                'courier_sync_error' => $exception->getMessage(),
            ];
        }
    }

    protected function extractUpsTrackingNumber(array $upsResponse): ?string
    {
        $candidates = [
            data_get($upsResponse, 'ShipmentResponse.ShipmentResults.ShipmentIdentificationNumber'),
            data_get($upsResponse, 'ShipmentResponse.ShipmentResults.PackageResults.0.TrackingNumber'),
            data_get($upsResponse, 'ShipmentResults.ShipmentIdentificationNumber'),
            data_get($upsResponse, 'ShipmentResults.PackageResults.0.TrackingNumber'),
        ];

        foreach ($candidates as $candidate) {
            if ($candidate !== null && $candidate !== '') {
                return (string) $candidate;
            }
        }

        return null;
    }

    protected function extractShipStationOrderId(array $shipStationResponse): ?string
    {
        foreach (['orderId', 'orderKey', 'orderNumber'] as $key) {
            $value = $shipStationResponse[$key] ?? null;

            if ($value !== null && $value !== '') {
                return (string) $value;
            }
        }

        return null;
    }

    protected function formatPublicOrder(CheckoutOrder $order): array
    {
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
            'total' => (float) $order->total,
            'courier_service' => $order->courier_service,
            'courier_reference' => $order->courier_reference,
            'courier_sync_status' => $order->courier_sync_status,
            'ups_tracking_number' => $order->ups_tracking_number,
            'shipstation_order_id' => $order->shipstation_order_id,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }

    public function externalShow(Request $request, CheckoutOrder $checkoutOrder): JsonResponse
    {
        $user = $request->user();

        // Ensure the request is authenticated and token has the required ability.
        if (! $user || ! $user->tokenCan('orders:read-external')) {
            abort(403, 'Unauthorized. Missing required token ability.');
        }

        // Return the order data structure
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
            'total' => (float) $order->total,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }
}
