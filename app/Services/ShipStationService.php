<?php

namespace App\Services;

use App\Models\CheckoutOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ShipStationService
{
    public function createOrderForCheckoutOrder(CheckoutOrder $order): array
    {
        $payload = $this->buildPayloadFromCheckoutOrder($order);

        return $this->createOrder($payload);
    }

    public function createOrder(array $payload): array
    {
        $baseUrl = rtrim((string) config('services.shipstation.base_url', 'https://ssapi.shipstation.com'), '/');
        $apiKey = (string) config('services.shipstation.api_key', '');
        $apiSecret = (string) config('services.shipstation.api_secret', '');
        $verifySsl = (bool) config('services.shipstation.verify_ssl', true);
        $caBundle = (string) config('services.shipstation.ca_bundle', '');

        if ($apiKey === '' || $apiSecret === '') {
            throw new RuntimeException('ShipStation API credentials are not configured.');
        }

        $request = Http::withBasicAuth($apiKey, $apiSecret)
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->retry(2, 400);

        if ($caBundle !== '') {
            $request = $request->withOptions(['verify' => $caBundle]);
        } elseif (! $verifySsl) {
            $request = $request->withOptions(['verify' => false]);
        }

        try {
            $response = $request->post($baseUrl . '/orders/createorder', $payload);
        } catch (ConnectionException $exception) {
            $isLocalSslError = app()->environment('local') && str_contains($exception->getMessage(), 'cURL error 60');

            if (! $isLocalSslError) {
                throw $exception;
            }

            // Local fallback for missing CA bundle on Windows dev machines.
            $response = Http::withBasicAuth($apiKey, $apiSecret)
                ->acceptJson()
                ->asJson()
                ->timeout(20)
                ->retry(1, 250)
                ->withOptions(['verify' => false])
                ->post($baseUrl . '/orders/createorder', $payload);
        }

        if ($response->failed()) {
            throw new RuntimeException('ShipStation request failed: ' . $response->status() . ' ' . $response->body());
        }

        return $response->json() ?? [];
    }

    protected function buildPayloadFromCheckoutOrder(CheckoutOrder $order): array
    {
        $items = collect($order->items ?? [])->map(function ($item, int $index): array {
            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $unitPrice = (float) ($item['priceValue'] ?? 0);
            $name = trim((string) ($item['name'] ?? 'Item ' . ($index + 1)));

            return [
                'lineItemKey' => (string) ($item['lineId'] ?? ($item['sku'] ?? Str::uuid()->toString())),
                'sku' => (string) ($item['sku'] ?? $item['productId'] ?? ''),
                'name' => $name !== '' ? $name : 'Item ' . ($index + 1),
                'quantity' => $quantity,
                'unitPrice' => number_format($unitPrice, 2, '.', ''),
                'imageUrl' => (string) ($item['image'] ?? ''),
                'options' => array_values(array_filter([
                    !empty($item['selectedColor']) ? [
                        'name' => 'Color',
                        'value' => (string) $item['selectedColor'],
                    ] : null,
                    !empty($item['selectedSize']) ? [
                        'name' => 'Size',
                        'value' => (string) $item['selectedSize'],
                    ] : null,
                ])),
            ];
        })->all();

        $fullName = trim($order->first_name . ' ' . $order->last_name);
        $countryCode = $this->normalizeCountryCode($order->country);

        return [
            'orderNumber' => (string) $order->order_number,
            'orderDate' => optional($order->created_at)->toIso8601String(),
            'orderStatus' => 'awaiting_shipment',
            'customerUsername' => (string) $order->email,
            'customerEmail' => (string) $order->email,
            'billTo' => [
                'name' => $fullName,
                'phone' => (string) ($order->phone ?? ''),
                'email' => (string) $order->email,
            ],
            'shipTo' => [
                'name' => $fullName,
                'street1' => (string) $order->address_line_1,
                'street2' => (string) ($order->address_line_2 ?? ''),
                'city' => (string) $order->city,
                'state' => (string) ($order->state ?? ''),
                'postalCode' => (string) ($order->postal_code ?? ''),
                'country' => $countryCode,
                'phone' => (string) ($order->phone ?? ''),
            ],
            'amountPaid' => number_format((float) $order->total, 2, '.', ''),
            'taxAmount' => 0,
            'shippingAmount' => number_format((float) $order->shipping, 2, '.', ''),
            'internalNotes' => (string) ($order->notes ?? ''),
            'items' => $items,
        ];
    }

    protected function normalizeCountryCode(?string $country): string
    {
        $value = strtoupper(trim((string) $country));

        if ($value === '') {
            return 'US';
        }

        if (strlen($value) === 2) {
            return $value;
        }

        $map = [
            'UNITED STATES' => 'US',
            'USA' => 'US',
            'UNITED STATES OF AMERICA' => 'US',
            'CANADA' => 'CA',
            'BANGLADESH' => 'BD',
            'INDIA' => 'IN',
            'PAKISTAN' => 'PK',
            'UNITED KINGDOM' => 'GB',
            'GREAT BRITAIN' => 'GB',
            'ENGLAND' => 'GB',
            'AUSTRALIA' => 'AU',
            'NEW ZEALAND' => 'NZ',
            'GERMANY' => 'DE',
            'FRANCE' => 'FR',
            'ITALY' => 'IT',
            'SPAIN' => 'ES',
            'NETHERLANDS' => 'NL',
            'SWEDEN' => 'SE',
            'NORWAY' => 'NO',
            'DENMARK' => 'DK',
            'SWITZERLAND' => 'CH',
            'JAPAN' => 'JP',
            'CHINA' => 'CN',
            'SINGAPORE' => 'SG',
            'UNITED ARAB EMIRATES' => 'AE',
            'SAUDI ARABIA' => 'SA',
        ];

        return $map[$value] ?? 'US';
    }
}
