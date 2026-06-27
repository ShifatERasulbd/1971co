<?php

namespace App\Services;

class ShippingRateService
{
    public function calculate(array $address, float $subtotal = 0.0): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        $country = $this->normalizeCountryCode($address['country'] ?? null);
        $state = strtoupper(trim((string) ($address['state'] ?? '')));

        if ($country === 'US') {
            if (in_array($state, ['AK', 'HI'], true)) {
                return 14.99;
            }

            return 8.99;
        }

        if ($country === 'CA') {
            return 16.99;
        }

        if ($country === 'GB') {
            return 19.99;
        }

        return 24.99;
    }

    public function normalizeCountryCode(?string $country): string
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
