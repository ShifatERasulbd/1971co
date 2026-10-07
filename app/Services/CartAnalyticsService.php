<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CartAnalyticsService
{
    /**
     * Log a cart addition event.
     *
     * @param int|string $productId
     * @param int|null $userId
     * @param string|null $sessionId
     * @return bool
     */
    public function logEvent($productId, $userId = null, $sessionId = null)
    {
        return DB::table('cart_events')->insert([
            'product_id' => $productId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Get the total cart event count for a specific product.
     *
     * @param int|string $productId
     * @return int
     */
    public function getCountForProduct($productId)
    {
        return DB::table('cart_events')
            ->where('product_id', $productId)
            ->count();
    }
}