<?php

namespace App\Services;

class ShippingRateService
{
    private const COUNTRY_ALIASES = [
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

    public function normalizeCountryCode(?string $country): string
    {
        $value = strtoupper(trim((string) $country));

        if ($value === '') {
            return 'US';
        }

        if (strlen($value) === 2) {
            return $value;
        }

        return self::COUNTRY_ALIASES[$value] ?? 'US';
    }
}
