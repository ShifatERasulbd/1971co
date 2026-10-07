<?php

namespace App\Http\Controllers;

use App\Services\CartAnalyticsService;
use Illuminate\Http\Request;

class CartAnalyticsController extends Controller
{
    protected $cartAnalyticsService;

    public function __construct(CartAnalyticsService $cartAnalyticsService)
    {
        $this->cartAnalyticsService = $cartAnalyticsService;
    }

    public function logAddToCart(Request $request) 
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $this->cartAnalyticsService->logEvent(
            $request->product_id,
            auth()->id(),
            session()->getId()
        );

        return response()->json(['success' => true]);
    }

    public function getAddToCartCount($productId) 
    {
        $count = $this->cartAnalyticsService->getCountForProduct($productId);

        return response()->json([
            'product_id' => $productId, 
            'cart_count' => $count
        ]);
    }
}