<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AuthenticatePublicApiKey;
use App\Http\Middleware\CachePublicGetResponse;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureUserType;

return Application::configure(basePath: dirname(__DIR__))
    ->withCommands([
        __DIR__.'/../app/Console/Commands',
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        $middleware->alias([
            'public-api-key' => AuthenticatePublicApiKey::class,
            'public.response.cache' => CachePublicGetResponse::class,
            'super-admin' => EnsureSuperAdmin::class,
            'user-type' => EnsureUserType::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
