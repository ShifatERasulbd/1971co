<?php

namespace App\Http\Controllers;

use App\Models\CheckoutOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutOrderController extends Controller
{
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
        ]);

        $orderNumber = sprintf('ORD-%s-%04d', now()->format('YmdHis'), random_int(0, 9999));

        $order = CheckoutOrder::create([
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
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
        ], 201);
    }
}
