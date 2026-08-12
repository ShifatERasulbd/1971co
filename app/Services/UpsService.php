<?php

namespace App\Services;

use App\Models\CheckoutOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class UpsService
{
    public function isConfigured(): bool
    {
        return $this->config('client_id') !== ''
            && $this->config('client_secret') !== ''
            && $this->config('shipper_number') !== '';
    }

    public function getShipmentCharge(array $payload, ?string $preferredServiceCode = null): float
    {
        $this->ensureConfigured();

        [$requestPayload] = $this->buildRateRequestPayload($payload);

        $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Shop');
        $response = $this->request('post', $rateEndpoint, $requestPayload);

        Log::info('UPS shipping rate response', [
            'endpoint' => $rateEndpoint,
            'request_payload' => $requestPayload,
            'response' => $response,
        ]);

        $amount = $this->extractRateAmount($response, $preferredServiceCode);

        if ($amount === null) {
            throw new RuntimeException('UPS did not return a valid shipment charge.');
        }

        return $amount;
    }

    public function getShipmentRateOptions(array $payload): array
    {
        $this->ensureConfigured();

        [$requestPayload] = $this->buildRateRequestPayload($payload);

        $rateEndpoint = $this->config('rate_endpoint', '/api/rating/v2409/Shop');
        $response = $this->request('post', $rateEndpoint, $requestPayload);

        Log::info('UPS shipping rate options response', [
            'endpoint' => $rateEndpoint,
            'request_payload' => $requestPayload,
            'response' => $response,
        ]);

        return $this->extractRateOptions($response);
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

    /**
     * Build a UPS Rating API request.
     *
     * The payload should contain:
     * - country
     * - state
     * - city
     * - postal_code
     * - weight
     * - items[] with weight/length/width/height/quantity
     *
     * UPS calculates billable/dimensional weight itself from the package
     * weight and dimensions sent here.
     */
    protected function buildRateRequestPayload(array $payload, ?array $origin = null): array
    {
        $countryCode = $this->normalizeCountryCode($payload['country'] ?? null);
        $state = strtoupper(trim((string) ($payload['state'] ?? '')));
        $city = trim((string) ($payload['city'] ?? ''));
        $postalCode = trim((string) ($payload['postal_code'] ?? ''));

        if ($postalCode === '') {
            throw new RuntimeException('UPS destination postal code is required.');
        }

        $items = $this->normalizeItems($payload['items'] ?? []);
        $weight = $this->resolvePayloadWeight($payload, $items);

        $isResidential = $this->resolveResidentialFlag($payload);
        $originAddress = $this->buildRateOriginAddress($origin);

        $dimensions = $this->resolvePackageDimensions($items);

        $isResidential = $this->resolveResidentialFlag([
            'residential' => data_get(
                $order->shipping_address ?? null,
                'residential',
                $order->residential ?? null
            ),
        ]);

        if ($dimensions === null) {
            throw new RuntimeException(
                'UPS package dimensions are required. Every package must have a positive length, width, and height.'
            );
        }

        $package = [
            'PackagingType' => [
                'Code' => (string) $this->config('packaging_code', '02'),
            ],
            'PackageWeight' => [
                'UnitOfMeasurement' => [
                    'Code' => 'LBS',
                ],
                'Weight' => number_format($weight, 2, '.', ''),
            ],
            'Dimensions' => [
                'UnitOfMeasurement' => [
                    'Code' => 'IN',
                ],
                'Length' => (string) $dimensions['length'],
                'Width' => (string) $dimensions['width'],
                'Height' => (string) $dimensions['height'],
            ],
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
                        'ShipperNumber' => (string) $this->config('shipper_number'),
                        'Address' => $originAddress,
                    ],
                    'ShipTo' => [
                        'Address' => $this->buildRateDestinationAddress(
                            $postalCode,
                            $countryCode,
                            $state,
                            $city,
                            $isResidential
                        ),
                    ],
                    'ShipFrom' => [
                        'Address' => $originAddress,
                    ],
                    'ShipmentRatingOptions' => [
                        // Ask UPS to return account/negotiated rates when
                        // the shipper account is authorized for them.
                        'NegotiatedRatesIndicator' => 'Y',
                    ],
                    'Package' => [$package],
                ],
            ],
        ];

        $normalizedInput = [
            'country_code' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight_lbs' => $weight,
            'dimensions_in' => $dimensions,
            'residential' => $isResidential,
            'negotiated_rates_requested' => true,
        ];

        Log::info('UPS rate request built', [
            'normalized_input' => $normalizedInput,
            'request_payload' => $requestPayload,
        ]);

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

        $items = $this->normalizeItems($order->items ?? []);
        $weight = $this->resolvePayloadWeight([], $items);

        $dimensions = $this->resolvePackageDimensions($items);

        $isResidential = $this->resolveResidentialFlag([
            'residential' => data_get(
                $order->shipping_address ?? null,
                'residential',
                $order->residential ?? null
            ),
        ]);

        if ($dimensions === null) {
            throw new RuntimeException(
                'Cannot create UPS shipment because package dimensions are missing or invalid.'
            );
        }

        $originAddress = $this->buildShipmentOriginAddress();

        $service = $this->resolveShipmentService([
            'country' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight' => $weight,
            'items' => $items,
        ], [
            'country' => $originAddress['CountryCode'],
            'state' => $originAddress['StateProvinceCode'],
            'city' => $originAddress['City'],
            'postal_code' => $originAddress['PostalCode'],
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
                        'Address' => $this->buildShipmentDestinationAddress(
                            $order,
                            $postalCode,
                            $countryCode,
                            $state,
                            $city,
                            $isResidential
                        ),
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
                            'Code' => (string) $this->config('packaging_code', '02'),
                            'Description' => 'Customer Box',
                        ],
                        'PackageWeight' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'LBS',
                            ],
                            'Weight' => number_format($weight, 2, '.', ''),
                        ],
                        'Dimensions' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'IN',
                            ],
                            'Length' => (string) $dimensions['length'],
                            'Width' => (string) $dimensions['width'],
                            'Height' => (string) $dimensions['height'],
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

        $shipmentEndpoint = $this->config(
            'shipment_endpoint',
            '/api/shipments/v2409/ship'
        );

        Log::info('UPS shipment request built', [
            'endpoint' => $shipmentEndpoint,
            'service' => $service,
            'weight_lbs' => $weight,
            'dimensions_in' => $dimensions,
        ]);

        return $this->createShipment($shipmentPayload);
    }

    protected function resolveShipmentService(array $payload, ?array $origin = null): array
    {
        $fallbackCode = (string) $this->config('service_code', '03');
        $fallbackDescription = (string) $this->config(
            'service_description',
            'UPS Ground'
        );

        try {
            [$requestPayload] = $this->buildRateRequestPayload($payload, $origin);

            $rateEndpoint = $this->config(
                'rate_endpoint',
                '/api/rating/v2409/Shop'
            );

            $rawResponse = $this->request(
                'post',
                $rateEndpoint,
                $requestPayload
            );

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
                        'description' => $ratedShipment['description']
                            ?? $fallbackDescription,
                    ];
                }
            }

            $selected = $ratedShipments[0];

            Log::warning(
                'Configured UPS service code is not available for this shipment; using first valid service.',
                [
                    'configured_service_code' => $fallbackCode,
                    'selected_service_code' => $selected['code'],
                    'selected_service_description' => $selected['description'] ?? null,
                    'destination_country' => $payload['country'] ?? null,
                    'destination_state' => $payload['state'] ?? null,
                    'destination_postal_code' => $payload['postal_code'] ?? null,
                ]
            );

            return [
                'code' => $selected['code'],
                'description' => $selected['description']
                    ?? $fallbackDescription,
            ];
        } catch (\Throwable $exception) {
            Log::warning(
                'Unable to resolve UPS service from rate quote; falling back to configured service.',
                [
                    'error' => $exception->getMessage(),
                    'configured_service_code' => $fallbackCode,
                    'destination_country' => $payload['country'] ?? null,
                    'destination_state' => $payload['state'] ?? null,
                    'destination_postal_code' => $payload['postal_code'] ?? null,
                ]
            );

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
                'description' => trim(
                    (string) data_get($row, 'Service.Description', '')
                ),
            ];
        }

        return $services;
    }

    public function createShipment(array $shipmentPayload): array
    {
        $this->ensureConfigured();

        $shipmentEndpoint = $this->config(
            'shipment_endpoint',
            '/api/shipments/v2409/ship'
        );

        try {
            return $this->request(
                'post',
                $shipmentEndpoint,
                $shipmentPayload
            );
        } catch (RuntimeException $exception) {
            if (! str_contains($exception->getMessage(), '111100')) {
                throw $exception;
            }

            $retryPayload = $this->withResolvedShipmentService($shipmentPayload);

            if ($retryPayload === null) {
                throw $exception;
            }

            return $this->request(
                'post',
                $shipmentEndpoint,
                $retryPayload
            );
        }
    }

    public function findTrackingNumberByInquiry(string $inquiry): ?string
    {
        $normalizedInquiry = trim($inquiry);

        if ($normalizedInquiry === '') {
            return null;
        }

        $this->ensureConfigured();

        $trackEndpointTemplate = (string) $this->config(
            'track_endpoint',
            '/api/track/v1/details/{inquiryNumber}'
        );

        $trackEndpoint = str_replace(
            '{inquiryNumber}',
            rawurlencode($normalizedInquiry),
            $trackEndpointTemplate
        );

        $response = $this->request('get', $trackEndpoint, []);

        return $this->extractTrackingNumberFromTrackResponse($response);
    }

    protected function withResolvedShipmentService(array $shipmentPayload): ?array
    {
        $countryCode = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipTo.Address.CountryCode',
            ''
        ));

        $state = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipTo.Address.StateProvinceCode',
            ''
        ));

        $city = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipTo.Address.City',
            ''
        ));

        $postalCode = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipTo.Address.PostalCode',
            ''
        ));

        $weight = max(
            0.5,
            (float) data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Package.0.PackageWeight.Weight',
                1.0
            )
        );

        if ($countryCode === '' || $postalCode === '') {
            return null;
        }

        $originCountry = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipFrom.Address.CountryCode',
            data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Shipper.Address.CountryCode',
                $this->config('origin_country', 'US')
            )
        ));

        $originState = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipFrom.Address.StateProvinceCode',
            data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Shipper.Address.StateProvinceCode',
                $this->config('origin_state', '')
            )
        ));

        $originCity = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipFrom.Address.City',
            data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Shipper.Address.City',
                $this->config('origin_city', '')
            )
        ));

        $originPostalCode = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.ShipFrom.Address.PostalCode',
            data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Shipper.Address.PostalCode',
                $this->config('origin_postal_code', '')
            )
        ));

        $dimensions = [
            'length' => (int) data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Package.0.Dimensions.Length',
                0
            ),
            'width' => (int) data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Package.0.Dimensions.Width',
                0
            ),
            'height' => (int) data_get(
                $shipmentPayload,
                'ShipmentRequest.Shipment.Package.0.Dimensions.Height',
                0
            ),
        ];

        if (
            $dimensions['length'] <= 0
            || $dimensions['width'] <= 0
            || $dimensions['height'] <= 0
        ) {
            return null;
        }

        $service = $this->resolveShipmentService([
            'country' => $countryCode,
            'state' => $state,
            'city' => $city,
            'postal_code' => $postalCode,
            'weight' => $weight,
            'items' => [[
                'weight' => $weight,
                'length' => $dimensions['length'],
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
                'quantity' => 1,
            ]],
        ], [
            'country' => $originCountry,
            'state' => $originState,
            'city' => $originCity,
            'postal_code' => $originPostalCode,
        ]);

        $currentCode = trim((string) data_get(
            $shipmentPayload,
            'ShipmentRequest.Shipment.Service.Code',
            ''
        ));

        $newCode = trim((string) ($service['code'] ?? ''));

        if ($newCode === '' || $newCode === $currentCode) {
            return null;
        }

        data_set(
            $shipmentPayload,
            'ShipmentRequest.Shipment.Service.Code',
            $newCode
        );

        data_set(
            $shipmentPayload,
            'ShipmentRequest.Shipment.Service.Description',
            (string) ($service['description'] ?? '')
        );

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
    ): array {
        $token = $this->getAccessToken();

        $url = rtrim(
            $this->config('base_url', 'https://wwwcie.ups.com'),
            '/'
        ) . '/' . ltrim($path, '/');

        $request = $this->baseRequest()
            ->withToken($token)
            ->acceptJson()
            ->asJson()
            ->timeout(25)
            ->retry(1, 300)
            ->withHeaders([
                'transId' => substr(uniqid('ups_', true), 0, 32),
                'transactionSrc' => 'LaravelCheckout',
            ]);

        $httpMethod = strtoupper($method);
        $options = $httpMethod === 'GET'
            ? []
            : ['json' => $payload];

        try {
            $response = $request->send(
                $httpMethod,
                $url,
                $options
            );
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
                    'transId' => substr(uniqid('ups_', true), 0, 32),
                    'transactionSrc' => 'LaravelCheckout',
                ])
                ->send($httpMethod, $url, $options);
        }

        if ($response->failed()) {
            $body = $response->body();
            $upsError = $this->extractUpsErrorDetails($body);
            $errorCode = $upsError['code'];
            $errorMessage = $upsError['message'] !== ''
                ? $upsError['message']
                : $body;

            if (
                $allowPaymentRetry
                && ($errorCode === '9120068' || str_contains($body, '9120068'))
                && isset($payload['ShipmentRequest']['Shipment']['PaymentInformation'])
            ) {
                unset(
                    $payload['ShipmentRequest']['Shipment']['PaymentInformation']
                );

                return $this->request(
                    $method,
                    $path,
                    $payload,
                    false
                );
            }

            // Do NOT retry 110609 by removing dimensions.
            // Dimensions are part of the package definition and must be
            // corrected rather than silently omitted.
            if ($errorCode === '110609' || str_contains($body, '110609')) {
                throw new RuntimeException(
                    'UPS rejected the package dimensions (110609). '
                    . 'Verify that Length, Width and Height are all greater than zero '
                    . 'and are sent in inches. Request: '
                    . json_encode(
                        $payload['RateRequest']['Shipment']['Package']
                            ?? $payload['ShipmentRequest']['Shipment']['Package']
                            ?? []
                    )
                );
            }

            if ($errorCode === '111100' || str_contains($body, '111100')) {
                $originSummary = sprintf(
                    '%s, %s %s, %s',
                    (string) $this->config('origin_city', ''),
                    (string) $this->config('origin_state', ''),
                    (string) $this->config('origin_postal_code', ''),
                    (string) $this->config('origin_country', '')
                );

                throw new RuntimeException(
                    'UPS API request failed with service/origin mismatch (111100). '
                    . 'Verify UPS_ORIGIN_ADDRESS_1, UPS_ORIGIN_CITY, '
                    . 'UPS_ORIGIN_STATE, UPS_ORIGIN_POSTAL_CODE, '
                    . 'UPS_ORIGIN_COUNTRY and UPS_SERVICE_CODE. '
                    . 'Current configured origin: ' . trim($originSummary)
                );
            }

            if ($errorCode === '9110006' || str_contains($body, '9110006')) {
                throw new RuntimeException(
                    'UPS API request failed because shipper address is missing (9110006). '
                    . 'Set UPS_ORIGIN_ADDRESS_1, UPS_ORIGIN_CITY, '
                    . 'UPS_ORIGIN_STATE, UPS_ORIGIN_POSTAL_CODE, '
                    . 'and UPS_ORIGIN_COUNTRY in .env.'
                );
            }

            if ($errorCode === '120100' || str_contains($body, '120100')) {
                throw new RuntimeException(
                    'UPS API request failed because the shipper number is missing or invalid (120100). '
                    . 'Verify UPS_SHIPPER_NUMBER in .env. Current value: '
                    . $this->maskValue(
                        (string) $this->config('shipper_number', '')
                    )
                );
            }

            throw new RuntimeException(
                'UPS API request failed: ' . $response->status()
                . ' ' . $errorMessage
                . ($errorCode !== null
                    ? ' (code ' . $errorCode . ')'
                    : '')
            );
        }

        return $response->json() ?? [];
    }

    protected function getAccessToken(): string
    {
        $this->ensureConfigured();

        $tokenUrl = rtrim(
            $this->config(
                'oauth_base_url',
                $this->config(
                    'base_url',
                    'https://wwwcie.ups.com'
                )
            ),
            '/'
        ) . '/' . ltrim(
            $this->config(
                'token_endpoint',
                '/security/v1/oauth/token'
            ),
            '/'
        );

        $request = $this->baseRequest()
            ->asForm()
            ->acceptJson()
            ->withBasicAuth(
                $this->config('client_id'),
                $this->config('client_secret')
            )
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
                ->withBasicAuth(
                    $this->config('client_id'),
                    $this->config('client_secret')
                )
                ->timeout(20)
                ->retry(1, 250)
                ->post($tokenUrl, [
                    'grant_type' => 'client_credentials',
                ]);
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'UPS OAuth failed: '
                . $response->status()
                . ' '
                . $response->body()
            );
        }

        $token = (string) data_get(
            $response->json(),
            'access_token',
            ''
        );

        if ($token === '') {
            throw new RuntimeException(
                'UPS OAuth token is missing in response.'
            );
        }

        return $token;
    }

    protected function baseRequest(): PendingRequest
    {
        $request = Http::acceptJson();

        $caBundle = trim(
            (string) $this->config('ca_bundle', '')
        );

        $verifySsl = (bool) $this->config(
            'verify_ssl',
            true
        );

        if ($caBundle !== '') {
            return $request->withOptions([
                'verify' => $caBundle,
            ]);
        }

        if (! $verifySsl) {
            return $request->withOptions([
                'verify' => false,
            ]);
        }

        return $request;
    }

    protected function isLocalSslError(
        ConnectionException $exception
    ): bool {
        return app()->environment('local')
            && str_contains(
                $exception->getMessage(),
                'cURL error 60'
            );
    }

    /**
     * Normalize checkout/order items.
     *
     * Supports an array, JSON string, or null.
     */
    protected function normalizeItems(mixed $items): array
    {
        if (is_string($items)) {
            $decoded = json_decode($items, true);

            if (is_array($decoded)) {
                $items = $decoded;
            }
        }

        if (! is_array($items)) {
            return [];
        }

        return array_values(
            array_filter(
                $items,
                static fn ($item) => is_array($item)
            )
        );
    }

    /**
     * Resolve the package weight.
     *
     * Priority:
     * 1. Explicit payload weight.
     * 2. Sum item weight × quantity.
     * 3. 0.8 lb fallback per item only when item weight is missing.
     */
    protected function resolvePayloadWeight(
        array $payload,
        array $items
    ): float {
        $explicitWeight = $payload['weight'] ?? null;

        if (is_numeric($explicitWeight) && (float) $explicitWeight > 0) {
            return round(max(0.5, (float) $explicitWeight), 2);
        }

        if ($items === []) {
            return 1.0;
        }

        $total = 0.0;

        foreach ($items as $item) {
            $quantity = max(
                1,
                (int) ($item['quantity'] ?? 1)
            );

            $itemWeight = is_numeric($item['weight'] ?? null)
                ? (float) $item['weight']
                : 0.8;

            if ($itemWeight <= 0) {
                $itemWeight = 0.8;
            }

            $total += $itemWeight * $quantity;
        }

        return round(max(0.5, $total), 2);
    }

    /**
     * Resolve one package from the checkout items.
     *
     * For the current ecommerce flow, all checkout items are rated as one
     * customer-supplied package. The largest dimension on each axis is used.
     *
     * If you later use multiple physical boxes, this method should be replaced
     * with a true cartonization/multi-package algorithm.
     */
    protected function resolvePackageDimensions(
        array $items
    ): ?array {
        if ($items === []) {
            return null;
        }

        $lengths = [];
        $widths = [];
        $heights = [];

        foreach ($items as $item) {
            $quantity = max(
                1,
                (int) ($item['quantity'] ?? 1)
            );

            $length = $this->normalizeDimensionValue(
                $item['length'] ?? null
            );

            $width = $this->normalizeDimensionValue(
                $item['width'] ?? null
            );

            $height = $this->normalizeDimensionValue(
                $item['height'] ?? null
            );

            if (
                $length === null
                || $width === null
                || $height === null
            ) {
                return null;
            }

            $lengths[] = $length;
            $widths[] = $width;

            // For multiple quantities, stack the same item's height.
            $heights[] = $height * $quantity;
        }

        if (
            $lengths === []
            || $widths === []
            || $heights === []
        ) {
            return null;
        }

        return [
            'length' => max(1, max($lengths)),
            'width' => max(1, max($widths)),
            'height' => max(1, array_sum($heights)),
        ];
    }

    protected function normalizeDimensionValue(
        mixed $value
    ): ?int {
        if (! is_numeric($value)) {
            return null;
        }

        $numeric = (float) $value;

        if ($numeric <= 0) {
            return null;
        }

        return max(1, (int) ceil($numeric));
    }

    protected function buildRateOriginAddress(
        ?array $origin = null
    ): array {
        $country = $origin['country']
            ?? $this->config('origin_country');

        $state = $origin['state']
            ?? $this->config('origin_state');

        $city = $origin['city']
            ?? $this->config('origin_city');

        $postalCode = $origin['postal_code']
            ?? $this->config('origin_postal_code');

        $country = $this->normalizeCountryCode(
            (string) $country
        );

        $state = strtoupper(trim((string) $state));
        $city = trim((string) $city);
        $postalCode = trim((string) $postalCode);

        if (
            $state === ''
            || $city === ''
            || $postalCode === ''
        ) {
            throw new RuntimeException(
                'UPS origin address is not configured. '
                . 'Set UPS_ORIGIN_CITY, UPS_ORIGIN_STATE, '
                . 'UPS_ORIGIN_POSTAL_CODE and UPS_ORIGIN_COUNTRY.'
            );
        }

        return [
            'PostalCode' => $postalCode,
            'CountryCode' => $country,
            'StateProvinceCode' => $state,
            'City' => $city,
        ];
    }

    protected function buildShipmentOriginAddress(): array
    {
        $country = $this->normalizeCountryCode(
            (string) $this->config('origin_country', 'US')
        );

        $state = strtoupper(
            trim((string) $this->config('origin_state', ''))
        );

        $city = trim(
            (string) $this->config('origin_city', '')
        );

        $postalCode = trim(
            (string) $this->config('origin_postal_code', '')
        );

        $addressLine = trim(
            (string) $this->config('origin_address_1', '')
        );

        if (
            $addressLine === ''
            || $city === ''
            || $state === ''
            || $postalCode === ''
        ) {
            throw new RuntimeException(
                'UPS ship-from address is not fully configured. '
                . 'Set UPS_ORIGIN_ADDRESS_1, UPS_ORIGIN_CITY, '
                . 'UPS_ORIGIN_STATE, UPS_ORIGIN_POSTAL_CODE and '
                . 'UPS_ORIGIN_COUNTRY in .env.'
            );
        }

        return [
            'AddressLine' => [$addressLine],
            'City' => $city,
            'StateProvinceCode' => $state,
            'PostalCode' => $postalCode,
            'CountryCode' => $country,
        ];
    }

    protected function resolveResidentialFlag(array $payload): bool
    {
        $value = $payload['residential'] ?? null;

        if ($value === null || $value === '') {
            return (bool) $this->config('default_residential', true);
        }

        if (is_bool($value)) {
            return $value;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    protected function buildRateDestinationAddress(
        string $postalCode,
        string $countryCode,
        string $state,
        string $city,
        bool $isResidential
    ): array {
        $address = [
            'PostalCode' => $postalCode,
            'CountryCode' => $countryCode,
            'StateProvinceCode' => $state,
            'City' => $city,
        ];

        if ($isResidential) {
            $address['ResidentialAddressIndicator'] = 'Y';
        }

        return $address;
    }

    protected function buildShipmentDestinationAddress(
        CheckoutOrder $order,
        string $postalCode,
        string $countryCode,
        string $state,
        string $city,
        bool $isResidential
    ): array {
        $address = [
            'AddressLine' => [
                trim((string) $order->address_line_1),
            ],
            'City' => $city,
            'StateProvinceCode' => $state,
            'PostalCode' => $postalCode,
            'CountryCode' => $countryCode,
        ];

        if ($isResidential) {
            $address['ResidentialAddressIndicator'] = 'Y';
        }

        return $address;
    }

    protected function extractRateAmount(
        array $response,
        ?string $preferredServiceCode = null
    ): ?float {
        $configuredServiceCode = trim(
            (string) $this->config('service_code', '03')
        );

        $rated = data_get(
            $response,
            'RateResponse.RatedShipment'
        );

        if (is_array($rated)) {
            $ratedRows = array_is_list($rated)
                ? $rated
                : [$rated];

            $cheapest = null;

            foreach ($ratedRows as $row) {
                if (! is_array($row)) {
                    continue;
                }

                $amount = $this->resolveRateAmountForRow($row);

                if ($amount === null) {
                    continue;
                }

                $value = (float) $amount;

                $serviceCode = trim(
                    (string) data_get(
                        $row,
                        'Service.Code',
                        ''
                    )
                );

                if (
                    $preferredServiceCode !== null
                    && $preferredServiceCode !== ''
                ) {
                    if (
                        $serviceCode
                        === $preferredServiceCode
                    ) {
                        return $value;
                    }

                    continue;
                }

                if (
                    $configuredServiceCode !== ''
                    && $serviceCode
                    === $configuredServiceCode
                ) {
                    return $value;
                }

                if (
                    $cheapest === null
                    || $value < $cheapest
                ) {
                    $cheapest = $value;
                }
            }

            if ($cheapest !== null) {
                return $cheapest;
            }
        }

        $candidates = [
            data_get(
                $response,
                'RateResponse.RatedShipment.0.TotalCharges.MonetaryValue'
            ),
            data_get(
                $response,
                'RateResponse.RatedShipment.TotalCharges.MonetaryValue'
            ),
            data_get(
                $response,
                'RatedShipment.0.TotalCharges.MonetaryValue'
            ),
            data_get(
                $response,
                'RatedShipment.TotalCharges.MonetaryValue'
            ),
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === null || $candidate === '') {
                continue;
            }

            return (float) $candidate;
        }

        Log::warning(
            'Unable to parse UPS rate amount from response.',
            ['response' => $response]
        );

        return null;
    }

    protected function extractRateOptions(
        array $response
    ): array {
        $rated = data_get(
            $response,
            'RateResponse.RatedShipment'
        );

        if (! is_array($rated)) {
            return [];
        }

        $ratedRows = array_is_list($rated)
            ? $rated
            : [$rated];

        $options = [];

        foreach ($ratedRows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $amount = $this->resolveRateAmountForRow($row);

            if ($amount === null) {
                continue;
            }

            $code = trim(
                (string) data_get(
                    $row,
                    'Service.Code',
                    ''
                )
            );

            if ($code === '') {
                continue;
            }

            $deliveryBy = trim(
                (string) data_get(
                    $row,
                    'GuaranteedDelivery.DeliveryByTime',
                    ''
                )
            );

            $deliveryDays = trim(
                (string) data_get(
                    $row,
                    'GuaranteedDelivery.BusinessDaysInTransit',
                    ''
                )
            );

            $serviceDescription = trim(
                (string) data_get(
                    $row,
                    'Service.Description',
                    $this->resolveUpsServiceLabel($code)
                )
            );

            $estimatedDelivery = $deliveryDays !== ''
                ? $deliveryDays . ' business days'
                : '1-3 business days';

            $options[] = [
                'code' => $code,
                'title' => $serviceDescription !== ''
                    ? $serviceDescription
                    : $this->resolveUpsServiceLabel($code),
                'label' => $this->resolveUpsServiceLabel($code),
                'price' => (float) $amount,
                'delivery_time' => $deliveryBy !== ''
                    ? $deliveryBy
                    : null,
                'delivery_days' => $deliveryDays !== ''
                    ? $deliveryDays
                    : null,
                'estimated_delivery' =>
                    'Estimated delivery: ' . $estimatedDelivery,
            ];
        }

        usort(
            $options,
            static fn (
                array $left,
                array $right
            ): int => $left['price'] <=> $right['price']
        );

        return $options;
    }

    /**
     * Negotiated rate is deliberately checked first.
     *
     * If UPS does not return a negotiated-rate container, the code falls
     * back to TotalCharges.
     */
    protected function resolveRateAmountForRow(
        array $row
    ): ?float {
        $candidates = [
            data_get(
                $row,
                'NegotiatedRateCharges.TotalCharge.MonetaryValue'
            ),
            data_get(
                $row,
                'NegotiatedRateCharges.TotalCharges.MonetaryValue'
            ),
            data_get(
                $row,
                'NegotiatedCharges.TotalCharge.MonetaryValue'
            ),
            data_get(
                $row,
                'NegotiatedCharges.TotalCharges.MonetaryValue'
            ),
            data_get(
                $row,
                'TotalCharges.MonetaryValue'
            ),
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === null || $candidate === '') {
                continue;
            }

            return (float) $candidate;
        }

        return null;
    }

    protected function resolveUpsServiceLabel(
        string $serviceCode
    ): string {
        return match ($serviceCode) {
            '01' => 'UPS Next Day Air',
            '02' => 'UPS 2nd Day Air',
            '03' => 'UPS Ground',
            '12' => 'UPS 3 Day Select',
            '13' => 'UPS Next Day Air Saver',
            '14' => 'UPS Next Day Air Early',
            '59' => 'UPS 2nd Day Air A.M.',
            default => 'UPS Service ' . $serviceCode,
        };
    }

    protected function extractTrackingNumberFromTrackResponse(
        array $response
    ): ?string {
        $candidates = [
            data_get(
                $response,
                'trackResponse.shipment.0.package.0.trackingNumber'
            ),
            data_get(
                $response,
                'trackResponse.shipment.package.0.trackingNumber'
            ),
            data_get(
                $response,
                'trackResponse.shipment.package.trackingNumber'
            ),
            data_get(
                $response,
                'shipment.0.package.0.trackingNumber'
            ),
            data_get(
                $response,
                'shipment.package.0.trackingNumber'
            ),
            data_get(
                $response,
                'shipment.package.trackingNumber'
            ),
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === null) {
                continue;
            }

            $value = trim((string) $candidate);

            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }

    protected function normalizeCountryCode(
        ?string $country
    ): string {
        $value = strtoupper(
            trim((string) $country)
        );

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

    protected function extractUpsErrorDetails(
        string $body
    ): array {
        $decoded = json_decode($body, true);

        $code = trim(
            (string) data_get(
                $decoded,
                'response.errors.0.code',
                ''
            )
        );

        $message = trim(
            (string) data_get(
                $decoded,
                'response.errors.0.message',
                ''
            )
        );

        return [
            'code' => $code !== ''
                ? $code
                : null,
            'message' => $message,
        ];
    }

    public function diagnostics(
        bool $probeAuth = true
    ): array {
        $details = [
            'configured' => $this->isConfigured(),
            'base_url' => (string) $this->config(
                'base_url',
                ''
            ),
            'oauth_base_url' => (string) $this->config(
                'oauth_base_url',
                ''
            ),
            'token_endpoint' => (string) $this->config(
                'token_endpoint',
                ''
            ),
            'rate_endpoint' => (string) $this->config(
                'rate_endpoint',
                ''
            ),
            'shipment_endpoint' => (string) $this->config(
                'shipment_endpoint',
                ''
            ),
            'verify_ssl' => (bool) $this->config(
                'verify_ssl',
                true
            ),
            'has_client_id' => trim(
                (string) $this->config(
                    'client_id',
                    ''
                )
            ) !== '',
            'has_client_secret' => trim(
                (string) $this->config(
                    'client_secret',
                    ''
                )
            ) !== '',
            'shipper_number_masked' => $this->maskValue(
                (string) $this->config(
                    'shipper_number',
                    ''
                )
            ),
            'origin' => [
                'address_1' => (string) $this->config(
                    'origin_address_1',
                    ''
                ),
                'city' => (string) $this->config(
                    'origin_city',
                    ''
                ),
                'state' => (string) $this->config(
                    'origin_state',
                    ''
                ),
                'postal_code' => (string) $this->config(
                    'origin_postal_code',
                    ''
                ),
                'country' => (string) $this->config(
                    'origin_country',
                    'US'
                ),
            ],
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

        return str_repeat(
            '*',
            $length - 4
        ) . substr($trimmed, -4);
    }

    protected function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException(
                'UPS credentials are not configured.'
            );
        }
    }

    protected function config(
        string $key,
        mixed $default = null
    ): mixed {
        return config(
            'services.ups.' . $key,
            $default
        );
    }
}