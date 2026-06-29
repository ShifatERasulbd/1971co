<?php

namespace App\Http\Middleware;

use App\Models\PublicApiKey;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Throwable;

class AuthenticatePublicApiKey
{
    public function handle(Request $request, Closure $next): mixed
    {
        $configuredKey = trim((string) config('services.public_orders.api_key'));
        $providedKey = trim((string) ($request->header('X-API-Key') ?? $request->bearerToken() ?? ''));

        if ($providedKey === '') {
            return new JsonResponse([
                'message' => 'Unauthorized. Invalid API key.',
            ], 401);
        }

        if ($configuredKey !== '' && hash_equals($configuredKey, $providedKey)) {
            return $next($request);
        }

        // Fallback to database-managed keys, allowing key creation from admin UI on live.
        try {
            if (Schema::hasTable('public_api_keys')) {
                $key = PublicApiKey::query()
                    ->where('is_active', true)
                    ->where('key_hash', hash('sha256', $providedKey))
                    ->first();

                if ($key) {
                    $key->forceFill(['last_used_at' => now()])->save();
                    return $next($request);
                }
            }
        } catch (Throwable) {
            // Keep auth middleware resilient if migration is not deployed yet.
        }

        return new JsonResponse([
            'message' => 'Unauthorized. Invalid API key.',
        ], 401);

    }
}