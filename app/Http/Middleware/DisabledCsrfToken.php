<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * No-op CSRF middleware.
 *
 * CSRF token enforcement is intentionally disabled project-wide.
 * Used as the `validate_csrf_token` override in config/sanctum.php so that
 * Sanctum's stateful SPA pipeline can still initialise session cookies without
 * rejecting requests that do not carry an XSRF token.
 */
class DisabledCsrfToken
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }
}
