<?php

namespace App\Http\Controllers;

use App\Services\ShipStationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipStationController extends Controller
{
    public function __construct(private readonly ShipStationService $shipStation)
    {
    }

    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'orderNumber' => 'required|string',
            'orderDate' => 'required|date',
            'shipTo.name' => 'required|string',
            'shipTo.street1' => 'required|string',
        ]);

        try {
            $result = $this->shipStation->createOrder($validated);
            return response()->json(['success' => true, 'data' => $result], 201);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}