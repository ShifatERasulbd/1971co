<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookConversionsApiService
{
    public function isConfigured(): bool
    {
        return (string) config('services.facebook.pixel_id') !== ''
            && (string) config('services.facebook.capi_access_token') !== '';
    }

    /**
     * Send a server-side event to the Meta Conversions API.
     *
     * @param  string  $eventName  e.g. "Purchase", "InitiateCheckout"
     * @param  array  $userData  raw (unhashed) user data: email, phone, first_name, last_name, city, state, zip, country, client_ip_address, client_user_agent, fbp, fbc
     * @param  array  $customData  e.g. value, currency, contents, content_ids, content_type, num_items
     * @param  string|null  $eventId  shared id used to de-duplicate against the browser Pixel event
     * @param  string|null  $eventSourceUrl
     */
    public function sendEvent(
        string $eventName,
        array $userData = [],
        array $customData = [],
        ?string $eventId = null,
        ?string $eventSourceUrl = null,
    ): bool {
        if (! $this->isConfigured()) {
            return false;
        }

        $pixelId = (string) config('services.facebook.pixel_id');
        $accessToken = (string) config('services.facebook.capi_access_token');
        $graphVersion = (string) config('services.facebook.graph_version', 'v21.0');
        $testEventCode = (string) config('services.facebook.test_event_code', '');

        $event = [
            'event_name' => $eventName,
            'event_time' => now()->timestamp,
            'action_source' => 'website',
            'user_data' => $this->buildUserData($userData),
        ];

        if ($eventId !== null && $eventId !== '') {
            $event['event_id'] = $eventId;
        }

        if ($eventSourceUrl !== null && $eventSourceUrl !== '') {
            $event['event_source_url'] = $eventSourceUrl;
        }

        if ($customData !== []) {
            $event['custom_data'] = $customData;
        }

        $payload = ['data' => [$event]];
        if ($testEventCode !== '') {
            $payload['test_event_code'] = $testEventCode;
        }

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->timeout(5)
                ->post(
                    sprintf('https://graph.facebook.com/%s/%s/events', $graphVersion, $pixelId),
                    $payload + ['access_token' => $accessToken],
                );

            if ($response->failed()) {
                Log::warning('Facebook CAPI request failed', [
                    'event_name' => $eventName,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            return true;
        } catch (ConnectionException $exception) {
            Log::warning('Facebook CAPI connection error', [
                'event_name' => $eventName,
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Hash and normalize PII fields per Meta's requirements; pass through non-PII fields.
     */
    private function buildUserData(array $userData): array
    {
        $hashedFields = ['email', 'phone', 'first_name', 'last_name', 'city', 'state', 'zip', 'country'];
        $passthroughFields = ['client_ip_address', 'client_user_agent', 'fbp', 'fbc'];

        $result = [];

        foreach ($hashedFields as $field) {
            $value = $userData[$field] ?? null;
            $normalized = $this->normalizeForHashing($field, $value);

            if ($normalized === '') {
                continue;
            }

            $metaField = match ($field) {
                'zip' => 'zp',
                'first_name' => 'fn',
                'last_name' => 'ln',
                'city' => 'ct',
                'state' => 'st',
                'country' => 'country',
                default => $field,
            };

            $result[$metaField] = hash('sha256', $normalized);
        }

        foreach ($passthroughFields as $field) {
            $value = $userData[$field] ?? null;
            if (is_string($value) && $value !== '') {
                $result[$field] = $value;
            }
        }

        return $result;
    }

    private function normalizeForHashing(string $field, mixed $value): string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return '';
        }

        $normalized = strtolower(trim((string) $value));

        if ($field === 'phone') {
            $normalized = preg_replace('/[^0-9]/', '', $normalized) ?? '';
        }

        return $normalized;
    }
}
