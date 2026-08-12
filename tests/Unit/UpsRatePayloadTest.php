<?php

namespace Tests\Unit;

use App\Services\UpsService;
use Tests\TestCase;

class UpsRatePayloadTest extends TestCase
{
    public function test_rate_request_omits_package_dimensions_for_ups_shop_quotes(): void
    {
        $service = new class extends UpsService {
            public function buildPayloadForTest(array $payload): array
            {
                [$requestPayload] = $this->buildRateRequestPayload($payload);

                return $requestPayload;
            }
        };

        $payload = [
            'country' => 'US',
            'state' => 'MA',
            'city' => 'Boston',
            'postal_code' => '02101',
            'weight' => 1.86,
            'items' => [[
                'length' => 14,
                'width' => 12,
                'height' => 2,
            ]],
        ];

        $requestPayload = $service->buildPayloadForTest($payload);

        $this->assertArrayNotHasKey('Dimensions', $requestPayload['RateRequest']['Shipment']['Package'][0]);
    }
}
