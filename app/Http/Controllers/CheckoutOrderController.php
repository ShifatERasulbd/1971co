<?php

namespace App\Http\Controllers;

use App\Models\CheckoutOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class CheckoutOrderController extends Controller
{
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

        $expectedAmount = (int) round(((float) $validated['total']) * 100);

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
            'country' => isset($validated['country']) ? trim((string) $validated['country']) : null,
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'items_count' => collect($validated['items'])->sum('quantity'),
            'subtotal' => $validated['subtotal'],
            'shipping' => $validated['shipping'],
            'total' => $validated['total'],
            'items' => $validated['items'],
            'status' => 'approved',
            'payment_provider' => 'stripe',
            'payment_status' => 'paid',
            'payment_intent_id' => $validated['payment_intent_id'],
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
        ], 201);
    }
}
