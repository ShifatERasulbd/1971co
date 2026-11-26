<?php

namespace App\Http\Controllers;

use App\Services\VariantAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartAvailabilityController extends Controller
{
    /**
     * Lists the cart lines that are marked out of stock, so checkout can stop before taking payment
     * (a cart can still hold a colour/size that was in stock when it was added).
     */
    public function __invoke(Request $request, VariantAvailability $availability): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|max:200',
            'items.*.lineId' => 'nullable|string|max:255',
            'items.*.productId' => 'nullable|string|max:255',
            'items.*.name' => 'nullable|string|max:255',
            'items.*.sku' => 'nullable|string|max:255',
            'items.*.selectedColor' => 'nullable|string|max:100',
            'items.*.selectedSize' => 'nullable|string|max:100',
        ]);

        return response()->json([
            'unavailable' => $availability->unavailableItems($validated['items']),
        ]);
    }
}
