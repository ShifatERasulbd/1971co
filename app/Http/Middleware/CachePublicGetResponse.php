<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CachePublicGetResponse
{
    public function handle(Request $request, Closure $next, int|string $ttlSeconds = 300): Response
    {
        if (!$request->isMethod('GET') || !$request->is('api/public/*')) {
            return $next($request);
        }

        if ((string) $request->query('nocache', '') === '1') {
            return $next($request);
        }

        $ttl = max(30, (int) $ttlSeconds);
        $cacheKey = 'api_public_response:' . sha1($request->fullUrl());

        $cached = Cache::get($cacheKey);
        if (is_array($cached) && isset($cached['content'], $cached['status'], $cached['headers'])) {
            return response($cached['content'], (int) $cached['status'], $cached['headers'])
                ->header('X-Response-Cache', 'HIT');
        }

        /** @var Response $response */
        $response = $next($request);

        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        $contentType = strtolower((string) $response->headers->get('Content-Type', ''));
        if (!str_contains($contentType, 'application/json')) {
            return $response;
        }

        $headers = [];
        foreach ($response->headers->allPreserveCaseWithoutCookies() as $name => $values) {
            $headers[$name] = implode(', ', $values);
        }

        Cache::put(
            $cacheKey,
            [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $headers,
            ],
            now()->addSeconds($ttl)
        );

        $response->headers->set('X-Response-Cache', 'MISS');

        return $response;
    }
}
