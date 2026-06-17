<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserType
{
    public function handle(Request $request, Closure $next, string ...$allowedTypes): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if ($allowedTypes === []) {
            return $next($request);
        }

        $normalizedAllowedTypes = array_values(array_unique(array_filter(array_map(
            static fn ($value) => strtolower(trim((string) $value)),
            $allowedTypes
        ))));

        $currentUserType = strtolower(trim((string) $user->user_type));

        if (in_array($currentUserType, $normalizedAllowedTypes, true)) {
            return $next($request);
        }

        // Compatibility: grant admin APIs to super-admin role holders.
        if (
            in_array('admin', $normalizedAllowedTypes, true)
            && method_exists($user, 'hasAnyRole')
            && $user->hasAnyRole(['admin', 'super-admin', 'super admin'])
        ) {
            return $next($request);
        }

        if (! in_array($currentUserType, $normalizedAllowedTypes, true)) {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}
