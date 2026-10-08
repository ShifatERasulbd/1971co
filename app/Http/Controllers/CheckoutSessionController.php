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

 public function index(Request $request): JsonResponse
{
    $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
    $status  = (string) $request->query('status', '');
    $search  = trim((string) $request->query('search', ''));

    // Latest row per session only
    $latestIds = CheckoutSession::selectRaw('MAX(id)')->groupBy('session_id');

    $query = CheckoutSession::whereIn('id', $latestIds);

    if ($status === 'abandoned') {
        $query->where('status', 'in_progress')
            ->where('last_activity_at', '<', now()->subHour());
    } elseif ($status === 'in_progress') {
        $query->where('status', 'in_progress')
            ->where('last_activity_at', '>=', now()->subHour());
    } elseif ($status === 'completed') {
        $query->where('status', 'completed');
    }

    if ($search !== '') {
        $like = '%' . $search . '%';
        $query->where(function ($q) use ($like) {
            $q->where('email', 'like', $like)
                ->orWhere('first_name', 'like', $like)
                ->orWhere('last_name', 'like', $like)
                ->orWhere('phone', 'like', $like)
                ->orWhere('session_id', 'like', $like)
                ->orWhere('order_number', 'like', $like);
        });
    }

    $page = $query->orderByDesc('last_activity_at')->orderByDesc('id')->paginate($perPage);

    return response()->json([
        'data' => $page->items(),
        'meta' => [
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
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