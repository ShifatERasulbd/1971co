<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Return the authenticated customer's saved cart so it can be
     * restored on any device they log in on.
     */
    public function show(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        return response()->json([
            'items' => $cart->items ?? [],
            'updated_at' => $cart?->updated_at,
        ]);
    }

    /**
     * Replace the authenticated customer's saved cart with the given items.
     * Called whenever the cart changes on any device so other devices can pick it up.
     */
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'present|array',
        ]);

        $cart = Cart::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['items' => $validated['items']],
        );

        return response()->json([
            'items' => $cart->items ?? [],
            'updated_at' => $cart->updated_at,
        ]);
    }
}
