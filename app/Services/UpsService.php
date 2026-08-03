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

        [$requestPayload, $normalizedInput] = $this->buildRateRequestPayload($payload);

        $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Shop');
        $response = $this->request('post', $rateEndpoint, $requestPayload);

        $amount = $this->extractRateAmount($response);
        if ($amount === null) {
            throw new RuntimeException('UPS did not return a valid shipment charge.');
        }

        return $amount;
    }

    public function diagnoseRateQuote(array $payload): array
    {
        $this->ensureConfigured();

        [$requestPayload, $normalizedInput] = $this->buildRateRequestPayload($payload);

        $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Shop');
        $response = $this->request('post', $rateEndpoint, $requestPayload);
        $amount = $this->extractRateAmount($response);

        return [
            'normalized_input' => $normalizedInput,
            'request_payload' => $requestPayload,
            'raw_response' => $response,
            'parsed_amount' => $amount,
        ];
    }

    protected function buildRateRequestPayload(array $payload, ?array $origin = null): array
    {
        $countryCode = $this->normalizeCountryCode($payload['country'] ?? null);
        $state = strtoupper(trim((string) ($payload['state'] ?? '')));
        $city = trim((string) ($payload['city'] ?? ''));
        $postalCode = trim((string) ($payload['postal_code'] ?? ''));
        $weight = max(0.5, (float) ($payload['weight'] ?? 1.0));
        $originAddress = [
            'PostalCode' => trim((string) ($origin['postal_code'] ?? $this->config('origin_postal_code', '10001'))),
            'CountryCode' => $this->normalizeCountryCode((string) ($origin['country'] ?? $this->config('origin_country', 'US'))),
            'StateProvinceCode' => strtoupper(trim((string) ($origin['state'] ?? $this->config('origin_state', 'NY')))),
            'City' => trim((string) ($origin['city'] ?? $this->config('origin_city', 'New York'))),
        ];

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
                        'Address' => $originAddress,
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
                        'Address' => $originAddress,
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

        $normalizedInput = [
            'country_code' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight_lbs' => $weight,
        ];

        return [$requestPayload, $normalizedInput];
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
        $originAddress = [
            'AddressLine' => [$this->config('origin_address_1', '123 Warehouse Rd')],
            'City' => $this->config('origin_city', 'New York'),
            'StateProvinceCode' => $this->config('origin_state', 'NY'),
            'PostalCode' => $this->config('origin_postal_code', '10001'),
            'CountryCode' => $this->config('origin_country', 'US'),
        ];
        $service = $this->resolveShipmentService([
            'country' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight' => $weight,
        ], [
            'country' => $originAddress['CountryCode'] ?? 'US',
            'state' => $originAddress['StateProvinceCode'] ?? 'NY',
            'city' => $originAddress['City'] ?? 'New York',
            'postal_code' => $originAddress['PostalCode'] ?? '10001',
        ]);

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
                        'Address' => $originAddress,
                    ],
                    'ShipFrom' => [
                        'Name' => $this->config('shipper_name', '1971Co'),
                        'Address' => $originAddress,
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
                        'Code' => $service['code'],
                        'Description' => $service['description'],
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

    protected function resolveShipmentService(array $payload, ?array $origin = null): array
    {
        $fallbackCode = (string) $this->config('service_code', '03');
        $fallbackDescription = (string) $this->config('service_description', 'UPS Ground');

        try {
            [$requestPayload] = $this->buildRateRequestPayload($payload, $origin);
            $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Shop');
            $rawResponse = $this->request('post', $rateEndpoint, $requestPayload);
            $ratedShipments = $this->extractRatedShipments($rawResponse);

            if ($ratedShipments === []) {
                return [
                    'code' => $fallbackCode,
                    'description' => $fallbackDescription,
                ];
            }

            foreach ($ratedShipments as $ratedShipment) {
                if (($ratedShipment['code'] ?? '') === $fallbackCode) {
                    return [
                        'code' => $fallbackCode,
                        'description' => $ratedShipment['description'] ?? $fallbackDescription,
                    ];
                }
            }

            $selected = $ratedShipments[0];

            Log::warning('Configured UPS service code is not available for this shipment; using first valid service.', [
                'configured_service_code' => $fallbackCode,
                'selected_service_code' => $selected['code'],
                'selected_service_description' => $selected['description'] ?? null,
                'destination_country' => $payload['country'] ?? null,
                'destination_state' => $payload['state'] ?? null,
                'destination_postal_code' => $payload['postal_code'] ?? null,
            ]);

            return [
                'code' => $selected['code'],
                'description' => $selected['description'] ?? $fallbackDescription,
            ];
        } catch (\Throwable $exception) {
            Log::warning('Unable to resolve UPS service from rate quote; falling back to configured service.', [
                'error' => $exception->getMessage(),
                'configured_service_code' => $fallbackCode,
                'destination_country' => $payload['country'] ?? null,
                'destination_state' => $payload['state'] ?? null,
                'destination_postal_code' => $payload['postal_code'] ?? null,
            ]);

            return [
                'code' => $fallbackCode,
                'description' => $fallbackDescription,
            ];
        }
    }

    protected function extractRatedShipments(array $response): array
    {
        $rated = data_get($response, 'RateResponse.RatedShipment');

        if (! is_array($rated)) {
            return [];
        }

        // Normalize UPS one-item object and many-item array shapes.
        $ratedRows = array_is_list($rated) ? $rated : [$rated];
        $services = [];

        foreach ($ratedRows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $code = trim((string) data_get($row, 'Service.Code', ''));
            if ($code === '') {
                continue;
            }

            $services[] = [
                'code' => $code,
                'description' => trim((string) data_get($row, 'Service.Description', '')),
            ];
        }

        return $services;
    }

    public function createShipment(array $shipmentPayload): array
    {
        $this->ensureConfigured();

        $shipmentEndpoint = $this->config('shipment_endpoint', '/api/shipments/v2409/ship');

        try {
            return $this->request('post', $shipmentEndpoint, $shipmentPayload);
        } catch (RuntimeException $exception) {
            if (! str_contains($exception->getMessage(), '111100')) {
                throw $exception;
            }

            $retryPayload = $this->withResolvedShipmentService($shipmentPayload);
            if ($retryPayload === null) {
                throw $exception;
            }

            return $this->request('post', $shipmentEndpoint, $retryPayload);
        }
    }

    protected function withResolvedShipmentService(array $shipmentPayload): ?array
    {
        $countryCode = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipTo.Address.CountryCode', ''));
        $state = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipTo.Address.StateProvinceCode', ''));
        $city = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipTo.Address.City', ''));
        $postalCode = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipTo.Address.PostalCode', ''));
        $weight = max(0.5, (float) data_get($shipmentPayload, 'ShipmentRequest.Shipment.Package.0.PackageWeight.Weight', 1.0));

        if ($countryCode === '' || $postalCode === '') {
            return null;
        }

        $originCountry = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipFrom.Address.CountryCode', data_get($shipmentPayload, 'ShipmentRequest.Shipment.Shipper.Address.CountryCode', $this->config('origin_country', 'US'))));
        $originState = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipFrom.Address.StateProvinceCode', data_get($shipmentPayload, 'ShipmentRequest.Shipment.Shipper.Address.StateProvinceCode', $this->config('origin_state', 'NY'))));
        $originCity = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipFrom.Address.City', data_get($shipmentPayload, 'ShipmentRequest.Shipment.Shipper.Address.City', $this->config('origin_city', 'New York'))));
        $originPostalCode = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.ShipFrom.Address.PostalCode', data_get($shipmentPayload, 'ShipmentRequest.Shipment.Shipper.Address.PostalCode', $this->config('origin_postal_code', '10001'))));

        $currentCode = trim((string) data_get($shipmentPayload, 'ShipmentRequest.Shipment.Service.Code', ''));
        $service = $this->resolveShipmentService([
            'country' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight' => $weight,
        ], [
            'country' => $originCountry,
            'state' => $originState,
            'city' => $originCity,
            'postal_code' => $originPostalCode,
        ]);

        $newCode = trim((string) ($service['code'] ?? ''));
        if ($newCode === '' || $newCode === $currentCode) {
            return null;
        }

        data_set($shipmentPayload, 'ShipmentRequest.Shipment.Service.Code', $newCode);
        data_set($shipmentPayload, 'ShipmentRequest.Shipment.Service.Description', (string) ($service['description'] ?? ''));

        Log::warning('Retrying UPS shipment with resolved service code.', [
            'previous_service_code' => $currentCode,
            'resolved_service_code' => $newCode,
            'destination_country' => $countryCode,
            'destination_state' => $state,
            'destination_postal_code' => $postalCode,
        ]);

        return $shipmentPayload;
    }

    protected function request(
        string $method,
        string $path,
        array $payload,
        bool $allowPaymentRetry = true,
        bool $allowOriginRetry = true,
    ): array
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

                return $this->request($method, $path, $payload, false, $allowOriginRetry);
            }

            if (str_contains($body, '111100')) {
                $originSummary = sprintf(
                    '%s, %s %s, %s',
                    (string) $this->config('origin_city', ''),
                    (string) $this->config('origin_state', ''),
                    (string) $this->config('origin_postal_code', ''),
                    (string) $this->config('origin_country', ''),
                );

                throw new RuntimeException(
                    'UPS API request failed with service/origin mismatch (111100). '
                    . 'Set UPS_ORIGIN_ADDRESS_1, UPS_ORIGIN_CITY, UPS_ORIGIN_STATE, UPS_ORIGIN_POSTAL_CODE, UPS_ORIGIN_COUNTRY to your real UPS ship-from address and verify UPS_SERVICE_CODE. '
                    . 'Current origin: ' . trim($originSummary)
                );
            }

            if (str_contains($body, '9110006')) {
                throw new RuntimeException(
                    'UPS API request failed because shipper address is missing (9110006). '
                    . 'Set UPS_ORIGIN_ADDRESS_1, UPS_ORIGIN_CITY, UPS_ORIGIN_STATE, UPS_ORIGIN_POSTAL_CODE, and UPS_ORIGIN_COUNTRY in .env.'
                );
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
        $configuredServiceCode = trim((string) $this->config('service_code', '03'));
        $rated = data_get($response, 'RateResponse.RatedShipment');

        if (is_array($rated)) {
            $ratedRows = array_is_list($rated) ? $rated : [$rated];
            $cheapest = null;

            foreach ($ratedRows as $row) {
                if (! is_array($row)) {
                    continue;
                }

                $amount = data_get($row, 'TotalCharges.MonetaryValue');
                if ($amount === null || $amount === '') {
                    continue;
                }

                $value = (float) $amount;
                $serviceCode = trim((string) data_get($row, 'Service.Code', ''));

                if ($configuredServiceCode !== '' && $serviceCode === $configuredServiceCode) {
                    return $value;
                }

                if ($cheapest === null || $value < $cheapest) {
                    $cheapest = $value;
                }
            }

            if ($cheapest !== null) {
                return $cheapest;
            }
        }

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

    public function diagnostics(bool $probeAuth = true): array
    {
        $details = [
            'configured' => $this->isConfigured(),
            'base_url' => (string) $this->config('base_url', ''),
            'oauth_base_url' => (string) $this->config('oauth_base_url', ''),
            'token_endpoint' => (string) $this->config('token_endpoint', ''),
            'rate_endpoint' => (string) $this->config('rate_endpoint', ''),
            'shipment_endpoint' => (string) $this->config('shipment_endpoint', ''),
            'verify_ssl' => (bool) $this->config('verify_ssl', true),
            'has_client_id' => trim((string) $this->config('client_id', '')) !== '',
            'has_client_secret' => trim((string) $this->config('client_secret', '')) !== '',
            'shipper_number_masked' => $this->maskValue((string) $this->config('shipper_number', '')),
        ];

        if (! $probeAuth) {
            $details['auth_probe'] = [
                'attempted' => false,
            ];

            return $details;
        }

        try {
            $token = $this->getAccessToken();

            $details['auth_probe'] = [
                'attempted' => true,
                'success' => true,
                'token_prefix' => substr($token, 0, 10),
                'token_length' => strlen($token),
            ];
        } catch (\Throwable $exception) {
            $details['auth_probe'] = [
                'attempted' => true,
                'success' => false,
                'error' => $exception->getMessage(),
            ];
        }

        return $details;
    }

    protected function maskValue(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '') {
            return '';
        }

        $length = strlen($trimmed);
        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . substr($trimmed, -4);
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
