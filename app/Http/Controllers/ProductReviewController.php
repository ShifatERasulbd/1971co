<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'orderId' => 'required',
            'reviews' => 'required|array',
            'reviews.*.rating' => 'required|integer|min:1|max:5',
            'reviews.*.comment' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;
        $orderId = $validated['orderId'];

        DB::transaction(function () use ($validated, $userId, $orderId) {
            foreach ($validated['reviews'] as $productId => $reviewData) {
                // 1. Save or update individual review item
                ProductReview::updateOrCreate(
                    [
                        'product_id' => $productId,
                        'user_id' => $userId,
                        'order_id' => $orderId,
                    ],
                    [
                        'rating' => $reviewData['rating'],
                        'comment' => $reviewData['comment'] ?? null,
                    ]
                );

                // 2. Recalculate and update the product's average rating and total count
                $product = Product::findOrFail($productId);
                
                $stats = ProductReview::where('product_id', $productId)
                    ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_count')
                    ->first();

                $product->update([
                    'average_rating' => round($stats->avg_rating, 2),
                    'rating_count' => $stats->total_count,
                ]);
            }
        });

        return response()->json([
            'message' => 'Reviews submitted successfully!'
        ], 200);
    }
}
