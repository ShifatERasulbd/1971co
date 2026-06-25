<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ShipStationService
{
    protected $baseUrl;
    protected $apiKey;
    protected $apiSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.shipstation.url', 'https://ssapi.shipstation.com');
        $this->apiKey = config('services.shipstation.key');
        $this->apiSecret = config('services.shipstation.secret');
    }

    /**
     * Helper to send authenticated requests
     */
    protected function client()
    {
        return Http::withBasicAuth($this->apiKey, $this->apiSecret)
            ->acceptJson();
    }

    /**
     * Create an order in ShipStation
     */
    public function createOrder(array $orderData)
    {
        $response = $this->client()->post("{$this->baseUrl}/orders/createorder", $orderData);

        return $response->json();
    }

    /**
     * Get list of shipments/tracking info
     */
    public function getShipments(array $queryParams = [])
    {
        $response = $this->client()->get("{$this->baseUrl}/shipments", $queryParams);

        return $response->json();
    }
}