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

        if (! in_array($user->user_type, $allowedTypes, true)) {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}
