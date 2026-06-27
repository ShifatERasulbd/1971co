<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'shipstation' => [
        'base_url' => env('SHIPSTATION_BASE_URL', 'https://ssapi.shipstation.com'),
        'api_key' => env('SHIPSTATION_API_KEY'),
        'api_secret' => env('SHIPSTATION_API_SECRET'),
        'verify_ssl' => env('SHIPSTATION_VERIFY_SSL', true),
        'ca_bundle' => env('SHIPSTATION_CA_BUNDLE'),
    ],

    'ups' => [
        'base_url' => env('UPS_BASE_URL', env('UPS_API_URL', 'https://wwwcie.ups.com')),
        'oauth_base_url' => env('UPS_OAUTH_BASE_URL', env('UPS_API_URL', 'https://wwwcie.ups.com')),
        'token_endpoint' => env('UPS_TOKEN_ENDPOINT', '/security/v1/oauth/token'),
        'rate_endpoint' => env('UPS_RATE_ENDPOINT', '/api/rating/v2409/Rate'),
        'shipment_endpoint' => env('UPS_SHIPMENT_ENDPOINT', '/api/shipments/v2409/ship'),
        'verify_ssl' => env('UPS_VERIFY_SSL', true),
        'ca_bundle' => env('UPS_CA_BUNDLE'),
        'client_id' => env('UPS_CLIENT_ID'),
        'client_secret' => env('UPS_CLIENT_SECRET'),
        'shipper_number' => env('UPS_SHIPPER_NUMBER'),
        'shipper_name' => env('UPS_SHIPPER_NAME', '1971Co'),
        'origin_address_1' => env('UPS_ORIGIN_ADDRESS_1', '123 Warehouse Rd'),
        'origin_city' => env('UPS_ORIGIN_CITY', 'New York'),
        'origin_state' => env('UPS_ORIGIN_STATE', 'NY'),
        'origin_postal_code' => env('UPS_ORIGIN_POSTAL_CODE', '10001'),
        'origin_country' => env('UPS_ORIGIN_COUNTRY', 'US'),
        'service_code' => env('UPS_SERVICE_CODE', '03'),
        'service_description' => env('UPS_SERVICE_DESCRIPTION', 'UPS Ground'),
        'packaging_code' => env('UPS_PACKAGING_CODE', '02'),
    ],

];
