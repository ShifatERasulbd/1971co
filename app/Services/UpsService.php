<?php

namespace App\Services;

use App\Models\CheckoutOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class UpsService
{
    public function isConfigured(): bool
    {
        return $this->config('client_id') !== ''
            && $this->config('client_secret') !== ''
            && $this->config('shipper_number') !== '';
    }

    public function getShipmentCharge(array $payload): float
    {
        $this->ensureConfigured();

        $countryCode = $this->normalizeCountryCode($payload['country'] ?? null);
        $state = strtoupper(trim((string) ($payload['state'] ?? '')));
        $city = trim((string) ($payload['city'] ?? ''));
        $postalCode = trim((string) ($payload['postal_code'] ?? ''));
        $weight = max(0.5, (float) ($payload['weight'] ?? 1.0));

        $requestPayload = [
            'RateRequest' => [
                'Request' => [
                    'RequestOption' => 'Shop',
                    'TransactionReference' => [
                        'CustomerContext' => 'Checkout Shipping Quote',
                    ],
                ],
                'Shipment' => [
                    'Shipper' => [
                        'ShipperNumber' => $this->config('shipper_number'),
                        'Address' => [
                            'PostalCode' => $this->config('origin_postal_code', '10001'),
                            'CountryCode' => $this->config('origin_country', 'US'),
                            'StateProvinceCode' => $this->config('origin_state', 'NY'),
                            'City' => $this->config('origin_city', 'New York'),
                        ],
                    ],
                    'ShipTo' => [
                        'Address' => [
                            'PostalCode' => $postalCode,
                            'CountryCode' => $countryCode,
                            'StateProvinceCode' => $state,
                            'City' => $city,
                        ],
                    ],
                    'ShipFrom' => [
                        'Address' => [
                            'PostalCode' => $this->config('origin_postal_code', '10001'),
                            'CountryCode' => $this->config('origin_country', 'US'),
                            'StateProvinceCode' => $this->config('origin_state', 'NY'),
                            'City' => $this->config('origin_city', 'New York'),
                        ],
                    ],
                    'Package' => [[
                        'PackagingType' => [
                            'Code' => $this->config('packaging_code', '02'),
                        ],
                        'PackageWeight' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'LBS',
                            ],
                            'Weight' => number_format($weight, 2, '.', ''),
                        ],
                    ]],
                ],
            ],
        ];

        $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Rate');
        $response = $this->request('post', $rateEndpoint, $requestPayload);

        $amount = $this->extractRateAmount($response);
        if ($amount === null) {
            throw new RuntimeException('UPS did not return a valid shipment charge.');
        }

        return $amount;
    }

    public function createShipmentForCheckoutOrder(CheckoutOrder $order): array
    {
        $this->ensureConfigured();

        $countryCode = $this->normalizeCountryCode($order->country);
        $state = strtoupper(trim((string) ($order->state ?? '')));
        $city = trim((string) ($order->city ?? ''));
        $postalCode = trim((string) ($order->postal_code ?? ''));
        $fullName = trim($order->first_name . ' ' . $order->last_name);
        $weight = $this->estimateWeightFromItems($order->items ?? []);

        $shipmentPayload = [
            'ShipmentRequest' => [
                'Request' => [
                    'RequestOption' => 'nonvalidate',
                    'TransactionReference' => [
                        'CustomerContext' => 'Checkout Order ' . $order->order_number,
                    ],
                ],
                'Shipment' => [
                    'Description' => 'Order ' . $order->order_number,
                    'Shipper' => [
                        'Name' => $this->config('shipper_name', '1971Co'),
                        'ShipperNumber' => $this->config('shipper_number'),
                        'Address' => [
                            'AddressLine' => [$this->config('origin_address_1', '123 Warehouse Rd')],
                            'City' => $this->config('origin_city', 'New York'),
                            'StateProvinceCode' => $this->config('origin_state', 'NY'),
                            'PostalCode' => $this->config('origin_postal_code', '10001'),
                            'CountryCode' => $this->config('origin_country', 'US'),
                        ],
                    ],
                    'ShipTo' => [
                        'Name' => $fullName !== '' ? $fullName : 'Customer',
                        'Address' => [
                            'AddressLine' => [trim((string) $order->address_line_1)],
                            'City' => $city,
                            'StateProvinceCode' => $state,
                            'PostalCode' => $postalCode,
                            'CountryCode' => $countryCode,
                        ],
                    ],
                    'Service' => [
                        'Code' => $this->config('service_code', '03'),
                        'Description' => $this->config('service_description', 'UPS Ground'),
                    ],
                    'PaymentInformation' => [
                        'ShipmentCharge' => [
                            'Type' => '01',
                            'BillShipper' => [
                                'AccountNumber' => $this->config('shipper_number'),
                            ],
                        ],
                    ],
                    'Package' => [[
                        'Packaging' => [
                            'Code' => $this->config('packaging_code', '02'),
                            'Description' => 'Customer Box',
                        ],
                        'PackageWeight' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'LBS',
                            ],
                            'Weight' => number_format($weight, 2, '.', ''),
                        ],
                    ]],
                ],
                'LabelSpecification' => [
                    'LabelImageFormat' => [
                        'Code' => 'GIF',
                    ],
                ],
            ],
        ];

        $shipmentEndpoint = $this->config('shipment_endpoint', '/api/shipments/v2409/ship');

        return $this->request('post', $shipmentEndpoint, $shipmentPayload);
    }

    public function createShipment(array $shipmentPayload): array
    {
        $this->ensureConfigured();

        $shipmentEndpoint = $this->config('shipment_endpoint', '/api/shipments/v2409/ship');

        return $this->request('post', $shipmentEndpoint, $shipmentPayload);
    }

    protected function request(string $method, string $path, array $payload, bool $allowPaymentRetry = true): array
    {
        $token = $this->getAccessToken();
        $url = rtrim($this->config('base_url', 'https://wwwcie.ups.com'), '/') . '/' . ltrim($path, '/');

        $request = $this->baseRequest()->withToken($token)
            ->acceptJson()
            ->asJson()
            ->timeout(25)
            ->retry(1, 300)
            ->withHeaders([
                'transId' => (string) uniqid('ups_', true),
                'transactionSrc' => 'LaravelCheckout',
            ]);

        try {
            $response = $request->send(strtoupper($method), $url, ['json' => $payload]);
        } catch (ConnectionException $exception) {
            if (! $this->isLocalSslError($exception)) {
                throw $exception;
            }

            // Local Windows fallback when CA cert chain is missing.
            $response = Http::withOptions(['verify' => false])
                ->withToken($token)
                ->acceptJson()
                ->asJson()
                ->timeout(25)
                ->retry(1, 300)
                ->withHeaders([
                    'transId' => (string) uniqid('ups_', true),
                    'transactionSrc' => 'LaravelCheckout',
                ])
                ->send(strtoupper($method), $url, ['json' => $payload]);
        }

        if ($response->failed()) {
            $body = $response->body();

            if (
                $allowPaymentRetry
                && str_contains($body, '9120068')
                && isset($payload['ShipmentRequest']['Shipment']['PaymentInformation'])
            ) {
                // UPS rejects account+card style payment hints together; retry once without PaymentInformation.
                unset($payload['ShipmentRequest']['Shipment']['PaymentInformation']);

                return $this->request($method, $path, $payload, false);
            }

            throw new RuntimeException('UPS API request failed: ' . $response->status() . ' ' . $body);
        }

        return $response->json() ?? [];
    }

    protected function getAccessToken(): string
    {
        $this->ensureConfigured();

        $tokenUrl = rtrim($this->config('oauth_base_url', $this->config('base_url', 'https://wwwcie.ups.com')), '/')
            . '/' . ltrim($this->config('token_endpoint', '/security/v1/oauth/token'), '/');

        $request = $this->baseRequest()->asForm()
            ->acceptJson()
            ->withBasicAuth($this->config('client_id'), $this->config('client_secret'))
            ->timeout(20)
            ->retry(1, 250);

        try {
            $response = $request->post($tokenUrl, [
                'grant_type' => 'client_credentials',
            ]);
        } catch (ConnectionException $exception) {
            if (! $this->isLocalSslError($exception)) {
                throw $exception;
            }

            $response = Http::withOptions(['verify' => false])
                ->asForm()
                ->acceptJson()
                ->withBasicAuth($this->config('client_id'), $this->config('client_secret'))
                ->timeout(20)
                ->retry(1, 250)
                ->post($tokenUrl, [
                    'grant_type' => 'client_credentials',
                ]);
        }

        if ($response->failed()) {
            throw new RuntimeException('UPS OAuth failed: ' . $response->status() . ' ' . $response->body());
        }

        $token = (string) data_get($response->json(), 'access_token', '');
        if ($token === '') {
            throw new RuntimeException('UPS OAuth token is missing in response.');
        }

        return $token;
    }

    protected function baseRequest(): PendingRequest
    {
        $request = Http::acceptJson();
        $caBundle = trim((string) $this->config('ca_bundle', ''));
        $verifySsl = (bool) $this->config('verify_ssl', true);

        if ($caBundle !== '') {
            return $request->withOptions(['verify' => $caBundle]);
        }

        if (! $verifySsl) {
            return $request->withOptions(['verify' => false]);
        }

        return $request;
    }

    protected function isLocalSslError(ConnectionException $exception): bool
    {
        return app()->environment('local') && str_contains($exception->getMessage(), 'cURL error 60');
    }

    protected function extractRateAmount(array $response): ?float
    {
        $candidates = [
            data_get($response, 'RateResponse.RatedShipment.0.TotalCharges.MonetaryValue'),
            data_get($response, 'RateResponse.RatedShipment.TotalCharges.MonetaryValue'),
            data_get($response, 'RatedShipment.0.TotalCharges.MonetaryValue'),
            data_get($response, 'RatedShipment.TotalCharges.MonetaryValue'),
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === null || $candidate === '') {
                continue;
            }

            return (float) $candidate;
        }

        Log::warning('Unable to parse UPS rate amount from response.', ['response' => $response]);

        return null;
    }

    protected function estimateWeightFromItems(array $items): float
    {
        $totalQuantity = 0;

        foreach ($items as $item) {
            $totalQuantity += max(1, (int) ($item['quantity'] ?? 1));
        }

        return max(1.0, $totalQuantity * 0.8);
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

    protected function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('UPS credentials are not configured.');
        }
    }

    protected function config(string $key, mixed $default = null): mixed
    {
        return config('services.ups.' . $key, $default);
    }
}
