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

   

    'veeqo' => [
        'base_url' => env('VEEQO_BASE_URL', 'https://api.veeqo.com'),
        'api_key' => env('VEEQO_API_KEY'),
        'verify_ssl' => env('VEEQO_VERIFY_SSL', true),
        'ca_bundle' => env('VEEQO_CA_BUNDLE'),
        'origin' => [
            'first_name' => env('VEEQO_ORIGIN_FIRST_NAME', '1971co'),
            'last_name' => env('VEEQO_ORIGIN_LAST_NAME', 'Warehouse'),
            'address1' => env('VEEQO_ORIGIN_ADDRESS1'),
            'city' => env('VEEQO_ORIGIN_CITY'),
            'state' => env('VEEQO_ORIGIN_STATE'),
            'zip' => env('VEEQO_ORIGIN_ZIP'),
            'country' => env('VEEQO_ORIGIN_COUNTRY', 'US'),
        ],
    ],

 
    'public_orders' => [
        'api_key' => env('PUBLIC_ORDERS_API_KEY'),
    ],

    'facebook' => [
        'pixel_id' => env('FACEBOOK_PIXEL_ID'),
        'capi_access_token' => env('FACEBOOK_CAPI_ACCESS_TOKEN'),
        'graph_version' => env('FACEBOOK_GRAPH_VERSION', 'v21.0'),
        'test_event_code' => env('FACEBOOK_CAPI_TEST_EVENT_CODE'),
    ],

];
