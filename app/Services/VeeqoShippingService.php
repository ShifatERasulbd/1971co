<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VeeqoShippingService
{
    protected string $baseUrl;

    protected string $apiKey;

    protected array $lastRequestPayload = [];

    protected mixed $lastResponseBody = null;

    protected ?int $lastResponseStatus = null;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.veeqo.base_url', 'https://api.veeqo.com'), '/');
        $this->apiKey = (string) config('services.veeqo.api_key');
    }

    public function isConfigured(): bool
    {
        return $this->apiKey !== '';
    }

    /**
     * Snapshot of the last request/response, useful for surfacing debug info to the client.
     */
    public function getDebugInfo(): array
    {
        return [
            'request' => $this->lastRequestPayload,
            'response_status' => $this->lastResponseStatus,
            'response_body' => $this->lastResponseBody,
        ];
    }

    /**
     * Get shipping rates from Veeqo for a single package built from the given
     * destination address and cart items (height/width/length/weight).
     *
     * @param array $toAddress Destination address (address_line_1, city, state, postal_code, country, ...)
     * @param array $items Cart items, each optionally carrying weight/length/width/height and quantity
     * @return array Normalized list of rate options
     */
    public function getShippingRates(array $toAddress, array $items): array
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Veeqo API key is not configured.');
        }

        $package = $this->buildPackageFromItems($items);

        $toName = trim(((string) ($toAddress['first_name'] ?? '')) . ' ' . ((string) ($toAddress['last_name'] ?? '')));

        $payload = [
            'to_address' => [
                'name' => $toName !== '' ? $toName : 'Customer',
                'phone' => (string) ($toAddress['phone'] ?? ''),
                'line1' => (string) ($toAddress['address_line_1'] ?? $toAddress['line1'] ?? ''),
                'town' => (string) ($toAddress['city'] ?? $toAddress['town'] ?? ''),
                'postcode' => (string) ($toAddress['postal_code'] ?? $toAddress['postcode'] ?? ''),
                'country_code' => (string) ($toAddress['country'] ?? 'US'),
                'county' => (string) ($toAddress['state'] ?? ''),
            ],
            'from_address' => $this->originAddress(),
            'parcels' => [
                [
                    'weight' => $package['weight'],
                    'weight_unit' => 'lb',
                    'height' => $package['height'],
                    'width' => $package['width'],
                    'length' => $package['length'],
                    'dimension_unit' => 'in',
                ],
            ],
            'customer_reference' => 'QUOTE-' . strtoupper(substr(md5(uniqid('', true)), 0, 10)),
            'include_unavailable_quotes' => false,
        ];

        $this->lastRequestPayload = $payload;
        $this->lastResponseStatus = null;
        $this->lastResponseBody = null;

        $verifySsl = filter_var(config('services.veeqo.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.veeqo.ca_bundle', ''));

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
                ->withOptions(['verify' => $caBundlePath !== '' ? $caBundlePath : $verifySsl])
                ->timeout(15)
                ->post("{$this->baseUrl}/shipping/api/v1/rates", $payload);
        } catch (\Illuminate\Http\Client\ConnectionException $exception) {
            $this->lastResponseBody = $exception->getMessage();

            Log::warning('Veeqo shipping rate request could not connect', [
                'payload' => $payload,
                'message' => $exception->getMessage(),
            ]);

            $message = str_contains($exception->getMessage(), 'cURL error 60')
                ? 'SSL certificate error connecting to Veeqo. Set VEEQO_VERIFY_SSL=false or configure VEEQO_CA_BUNDLE.'
                : 'Failed to connect to Veeqo.';

            throw new \RuntimeException($message, 0, $exception);
        }

        $this->lastResponseStatus = $response->status();
        $this->lastResponseBody = $response->json() ?? $response->body();

        if (! $response->successful()) {
            Log::warning('Veeqo shipping rate request failed', [
                'payload' => $payload,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $errorMessages = $response->json('error_messages');
            $message = is_array($errorMessages) && $errorMessages !== []
                ? implode(' ', $errorMessages)
                : 'Unable to retrieve shipping rates from Veeqo.';

            throw new \RuntimeException($message);
        }

        return $this->normalizeRates($response->json());
    }

    protected function originAddress(): array
    {
        $name = trim(config('services.veeqo.origin.first_name', '') . ' ' . config('services.veeqo.origin.last_name', ''));

        return [
            'name' => $name !== '' ? $name : '1971co Warehouse',
            'company' => (string) config('services.veeqo.origin.company', ''),
            'phone' => (string) config('services.veeqo.origin.phone', ''),
            'line1' => (string) config('services.veeqo.origin.address1', ''),
            'town' => (string) config('services.veeqo.origin.city', ''),
            'postcode' => (string) config('services.veeqo.origin.zip', ''),
            'country_code' => (string) config('services.veeqo.origin.country', 'US'),
            'county' => (string) config('services.veeqo.origin.state', ''),
        ];
    }

    /**
     * Collapse cart items into a single package's weight and dimensions.
     * Weight is summed across quantities; dimensions use the largest item.
     */
    protected function buildPackageFromItems(array $items): array
    {
        $totalWeight = 0.0;
        $length = 0.0;
        $width = 0.0;
        $height = 0.0;

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $weight = (float) ($item['weight'] ?? 0);
            $totalWeight += $weight * $quantity;

            $length = max($length, (float) ($item['length'] ?? 0));
            $width = max($width, (float) ($item['width'] ?? 0));
            $height = max($height, (float) ($item['height'] ?? 0));
        }

        return [
            'weight' => $totalWeight > 0 ? round($totalWeight, 2) : 1.0,
            'length' => $length > 0 ? round($length, 2) : 10.0,
            'width' => $width > 0 ? round($width, 2) : 8.0,
            'height' => $height > 0 ? round($height, 2) : 4.0,
        ];
    }

    protected function normalizeRates(mixed $payload): array
    {
        $rates = is_array($payload) ? ($payload['quotes'] ?? []) : [];

        if (! is_array($rates)) {
            return [];
        }

        $normalized = [];

        foreach ($rates as $rate) {
            if (! is_array($rate)) {
                continue;
            }

            $carrier = (string) ($rate['carrier_id'] ?? $rate['service_carrier'] ?? '');
            $service = (string) ($rate['service_name'] ?? '');
            $price = (float) ($rate['total_charge'] ?? $rate['base_rate'] ?? 0);
            $deliveryEstimate = $rate['delivery_estimate'] ?? null;
            $deliveryDays = null;

            if (is_string($deliveryEstimate) && $deliveryEstimate !== '') {
                try {
                    $deliveryDays = max(0, now()->diffInDays(new \DateTime($deliveryEstimate), false));
                } catch (\Throwable) {
                    $deliveryDays = null;
                }
            }

            $normalized[] = [
                'code' => (string) ($rate['rate_id'] ?? (trim($carrier . '-' . $service, '-') ?: uniqid('rate_', true))),
                'carrier' => $carrier,
                'service' => $service,
                'price' => round($price, 2),
                'delivery_days' => $deliveryDays,
                'estimated_delivery' => $deliveryEstimate,
                'label' => null,
            ];
        }

        usort($normalized, static fn ($a, $b) => $a['price'] <=> $b['price']);

        // UPS Ground is our default "Standard Delivery" option; surface it first when available.
        foreach ($normalized as $index => $rate) {
            $isUpsGround = strcasecmp($rate['carrier'], 'UPS') === 0
                && stripos($rate['service'], 'ground') !== false
                && stripos($rate['service'], 'saver') === false;

            if ($isUpsGround) {
                $normalized[$index]['label'] = 'Standard Delivery';
                $standard = $normalized[$index];
                unset($normalized[$index]);
                array_unshift($normalized, $standard);
                $normalized = array_values($normalized);
                break;
            }
        }

        return $normalized;
    }
}