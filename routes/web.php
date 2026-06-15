<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\FeaturesController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\OurStorySectionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GrandChildController;
use App\Http\Controllers\CanadaWarehouseStockController;
use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\SubCategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

Route::get('/', function () {
    return view('home');
});

Route::get('/shop', function () {
    return view('home');
});

Route::get('/singleProduct', function () {
    return view('home');
});


Route::get('/about', function () {
    return view('home');
});

Route::get('/contact', function () {
    return view('home');
});

Route::get('/login', function () {
    return view('home');
});

Route::get('/register', function () {
    return view('home');
});

Route::get('/admin', function () {
    return view('app');
})->name('login');

Route::prefix('api')->withoutMiddleware([ValidateCsrfToken::class])->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::get('/public/hero', [HeroController::class, 'publicHero']);
    Route::get('/public/heroes', [HeroController::class, 'publicHeroes']);
    Route::get('/public/features', [FeaturesController::class, 'publicIndex']);
    Route::get('/public/colors', [ColorController::class, 'index']);
    Route::get('/public/collections', [CollectionController::class, 'publicIndex']);
    Route::get('/public/our-story', [OurStorySectionController::class, 'publicIndex']);
    Route::get('/public/products', [\App\Http\Controllers\ProductController::class, 'publicIndex']);
    Route::get('/public/categories', [CategoryController::class, 'index']);
    Route::get('/public/sub-categories', [SubCategoryController::class, 'index']);
    Route::get('/public/grand-childs', [GrandChildController::class, 'index']);
    Route::get('/public/settings', [SettingsController::class, 'publicLatest']);
    Route::get('/public/best-sellers-section', [SettingsController::class, 'publicBestSellersSection']);

    

    Route::middleware('auth:sanctum')->group(function () {
        

        Route::get('/user', function (Request $request) {
            return response()->json($request->user());
        });

        Route::post('/logout', [AuthController::class, 'logout']);
        
        // size Controller
        Route::apiResource('/sizes', SizeController::class);

        // color Controller
        Route::apiResource('/colors', ColorController::class);
        
        // Hero Controller
        Route::apiResource('/heroes', HeroController::class);

        // Features Controller
        Route::apiResource('/features', FeaturesController::class);

        // Collections Builder Controller
        Route::get('/collections', [CollectionController::class, 'index']);
        Route::put('/collections', [CollectionController::class, 'update']);

        // Our Story Builder Controller
        Route::get('/our-story', [OurStorySectionController::class, 'index']);
        Route::post('/our-story', [OurStorySectionController::class, 'update']);

        // Category Controller
        Route::apiResource('/categories', CategoryController::class);

        // SubCategory Controller
        Route::apiResource('/sub-categories', SubCategoryController::class);

        // GrandChild Controller
        Route::apiResource('/grand-childs', GrandChildController::class);
        
        // Inventory public API proxy (Canada warehouse)
        Route::get('/inventory/canada-warehouse-stocks', [CanadaWarehouseStockController::class, 'index']);

        // API Products (synced from Inventory)
        Route::get('/api-products', [ApiProductController::class, 'index']);
        Route::post('/api-products/sync', [ApiProductController::class, 'sync']);
       
        // Settings Controller
        Route::apiResource('/settings', SettingsController::class);
        Route::get('/website/best-sellers-section', [SettingsController::class, 'bestSellersSection']);
        Route::put('/website/best-sellers-section', [SettingsController::class, 'updateBestSellersSection']);

        // Product Controller (CRUD)
        Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
        Route::get('/products/{product}', [\App\Http\Controllers\ProductController::class, 'show']);
        Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store']);
        Route::put('/products/{product}', [\App\Http\Controllers\ProductController::class, 'update']);
        Route::delete('/products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy']);

    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api).*$');
});

