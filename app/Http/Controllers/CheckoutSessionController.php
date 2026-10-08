<?php

namespace App\Http\Controllers;

use App\Models\CheckoutSession;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class CheckoutSessionController extends Controller
{
    private const FIELDS = [
        'first_name', 'last_name', 'email', 'phone', 'address_line_1',
        'address_line_2', 'city', 'state', 'postal_code', 'country', 'notes',
    ];


public function index(): JsonResponse
{
    $checkoutSessions = CheckoutSession::latest()->get();

    return response()->json([
        'data' => $checkoutSessions,
        'meta' => [
            'current_page' => 1,
            'last_page'    => 1,
            'per_page'     => $checkoutSessions->count(),
            'total'        => $checkoutSessions->count(),
        ],
    ]);
}

    public function store(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:100'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['nullable', 'array', 'max:100'],
            'subtotal' => ['nullable', 'numeric'],
            'shipping' => ['nullable', 'numeric'],
            'tax' => ['nullable', 'numeric'],
            'total' => ['nullable', 'numeric'],
        ]);

        // Ignore sessions that already turned into an order
        $existingCompleted = CheckoutSession::where('session_id', $data['session_id'])
            ->where('status', 'completed')
            ->exists();

        if ($existingCompleted) {
            return response()->json(['success' => true, 'ignored' => true]);
        }

        // Always set every field; a blank one (e.g. email) becomes '' so the insert never fails
        $fields = [];
        foreach (self::FIELDS as $field) {
            $fields[$field] = (string) ($data[$field] ?? '');
        }

        $items = collect($data['items'] ?? [])
            ->map(fn ($item) => Arr::only((array) $item, [
                'lineId', 'productId', 'name', 'priceValue', 'quantity', 'image',
                'selectedColor', 'selectedSize', 'weight', 'length', 'width', 'height',
            ]))
            ->values()
            ->all();

        try {
            // New row for every change
            $checkout = new CheckoutSession();
            $checkout->session_id = $data['session_id'];
            $checkout->fill($fields);
            $checkout->items = $items;
            $checkout->subtotal = $data['subtotal'] ?? 0;
            $checkout->shipping = $data['shipping'] ?? 0;
            $checkout->tax = $data['tax'] ?? 0;
            $checkout->total = $data['total'] ?? 0;
            $checkout->status = 'in_progress';
            $checkout->ip_address = $request->ip();
            $checkout->user_agent = substr((string) $request->userAgent(), 0, 500);
            $checkout->last_activity_at = now();
            $checkout->save();
        } catch (\Throwable $e) {
            Log::error('Checkout session save failed: ' . $e->getMessage());

            return response()->json(['success' => false], 500);
        }

        return response()->json(['success' => true]);
    }

    public function complete(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:100'],
            'order_number' => ['nullable', 'string', 'max:100'],
        ]);

        // Mark every row of this session as completed
        CheckoutSession::where('session_id', $data['session_id'])->update([
            'status' => 'completed',
            'order_number' => $data['order_number'] ?? null,
            'last_activity_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}