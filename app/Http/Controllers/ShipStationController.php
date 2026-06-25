<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ShipStationService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected $shipStation;

    public function __construct(ShipStationService $shipStation)
    {
        $this->shipStation = $shipStation;
    }

    public function storeOrder(Request $request)
    {
        // 1. Validate your incoming request data from React
        $validated = $request->validate([
            'orderNumber' => 'required|string',
            'orderDate' => 'required|date',
            'shipTo.name' => 'required|string',
            'shipTo.street1' => 'required|string',
            // ... add other necessary validation rules
        ]);

        // 2. Format and send to ShipStation
        try {
            $result = $this->shipStation->createOrder($validated);
            return response()->json(['success' => true, 'data' => $result], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}