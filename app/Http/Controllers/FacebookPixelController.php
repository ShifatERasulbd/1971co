<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class FacebookPixelController extends Controller
{
    public function publicConfig(): JsonResponse
    {
        $pixelId = (string) config('services.facebook.pixel_id');

        return response()->json([
            'configured' => $pixelId !== '',
            'pixelId' => $pixelId,
        ]);
    }
}
