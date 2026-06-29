<?php

use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CanadaWarehouseStockController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\CheckoutOrderController;
use App\Http\Controllers\AboutHeroController;
use App\Http\Controllers\AboutGivingBackController;
use App\Http\Controllers\AboutMissionController;
use App\Http\Controllers\AboutStoryController;
use App\Http\Controllers\CommunityPageSectionController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\GrandChildController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\HomeBackgroundSectionController;
use App\Http\Controllers\OurStorySectionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicApiKeyController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\Payment\StripeController;
use App\Http\Controllers\ShipStationController;
use App\Http\Controllers\UPSCourierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/login', [AuthController::class, 'login'])->middleware(['web', 'throttle:6,1']);
Route::post('/register', [AuthController::class, 'register'])->middleware(['web', 'throttle:6,1']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware(['web', 'throttle:6,1']);
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware(['web', 'throttle:6,1']);
Route::get('/public/about-hero', [AboutHeroController::class, 'publicIndex']);
Route::get('/public/about-story', [AboutStoryController::class, 'publicIndex']);
Route::get('/public/about-mission', [AboutMissionController::class, 'publicIndex']);
Route::get('/public/about-giving-back', [AboutGivingBackController::class, 'publicIndex']);
Route::get('/public/colors', [ColorController::class, 'index']);
Route::get('/public/collections', [CollectionController::class, 'publicIndex']);
Route::get('/public/hero', [HeroController::class, 'publicIndex']);
Route::get('/public/heroes', [HeroController::class, 'publicList']);
Route::get('/public/features', [FeatureController::class, 'publicIndex']);
Route::get('/public/home-background-section', [HomeBackgroundSectionController::class, 'publicIndex']);
Route::get('/public/our-story', [OurStorySectionController::class, 'publicIndex']);
Route::get('/public/products', [ProductController::class, 'publicIndex']);
Route::get('/public/shop-products', [ProductController::class, 'publicShopIndex']);
Route::get('/public/sizes', [SizeController::class, 'index']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/sub-categories', [SubCategoryController::class, 'index']);
Route::get('/public/grand-childs', [GrandChildController::class, 'index']);
Route::get('/public/settings', [SettingsController::class, 'publicLatest']);
Route::get('/public/best-sellers-section', [SettingsController::class, 'publicBestSellersSection']);
Route::get('/public/stripe-config', [StripeController::class, 'publicConfig']);
Route::post('/public/shipping/quote', [CheckoutOrderController::class, 'quoteShipping']);
Route::get('/public/community-page-sections', [CommunityPageSectionController::class, 'publicIndex']);
Route::post('/public/orders', [CheckoutOrderController::class, 'store']);
Route::get('/public/orders/{orderNumber}', [CheckoutOrderController::class, 'publicShow']);
Route::middleware('public-api-key')->prefix('/public/orders-feed')->group(function () {
	Route::get('/', [CheckoutOrderController::class, 'publicExternalIndex']);
	Route::get('/{checkoutOrder}', [CheckoutOrderController::class, 'publicExternalShow']);
});
Route::post('/create-payment-intent', [StripeController::class, 'createPaymentIntent']);
Route::post('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::post('/shipping/orders', [ShipStationController::class, 'storeOrder']);
Route::post('/ups/shipments', [UPSCourierController::class, 'storeShipment']);
Route::middleware('auth:sanctum')->group(function () {
	Route::get('/user', function (Request $request) {
		return response()->json($request->user());
	});

	Route::post('/logout', [AuthController::class, 'logout'])->middleware('web');

	Route::middleware('user-type:customer')->group(function () {
		Route::get('/customer/orders', [CheckoutOrderController::class, 'customerIndex']);
		Route::get('/customer/orders/{checkoutOrder}', [CheckoutOrderController::class, 'customerShow']);
		Route::put('/customer/orders/{checkoutOrder}/cancel', [CheckoutOrderController::class, 'customerCancel']);
	});

	Route::middleware('user-type:admin')->group(function () {

	Route::apiResource('/sizes', SizeController::class);
	Route::apiResource('/colors', ColorController::class);
	Route::get('/heroes', [HeroController::class, 'index']);
	Route::post('/heroes', [HeroController::class, 'store']);
	Route::put('/heroes/{hero}', [HeroController::class, 'update']);
	Route::apiResource('/features', FeatureController::class);
	Route::get('/about-hero', [AboutHeroController::class, 'index']);
	Route::post('/about-hero', [AboutHeroController::class, 'update']);
	Route::get('/about-story', [AboutStoryController::class, 'index']);
	Route::post('/about-story', [AboutStoryController::class, 'update']);
	Route::get('/about-mission', [AboutMissionController::class, 'index']);
	Route::post('/about-mission', [AboutMissionController::class, 'update']);
	Route::get('/about-giving-back', [AboutGivingBackController::class, 'index']);
	Route::post('/about-giving-back', [AboutGivingBackController::class, 'update']);
	// Community Page Sections
	Route::get('/community-page-sections', [CommunityPageSectionController::class, 'index']);
	Route::post('/community-page-sections', [CommunityPageSectionController::class, 'store']);
	Route::post('/community-page-sections/upload-feature-image', [CommunityPageSectionController::class, 'uploadFeatureImage']);
	Route::get('/community-page-sections/{key}', [CommunityPageSectionController::class, 'show']);
	Route::delete('/community-page-sections/{key}', [CommunityPageSectionController::class, 'destroy']);

	Route::get('/collections', [CollectionController::class, 'index']);
	Route::put('/collections', [CollectionController::class, 'update']);

	Route::get('/our-story', [OurStorySectionController::class, 'index']);
	Route::post('/our-story', [OurStorySectionController::class, 'update']);
	Route::get('/home-background-section', [HomeBackgroundSectionController::class, 'index']);
	Route::post('/home-background-section', [HomeBackgroundSectionController::class, 'update']);

	Route::apiResource('/categories', CategoryController::class);
	Route::apiResource('/sub-categories', SubCategoryController::class);
	Route::apiResource('/grand-childs', GrandChildController::class);

	Route::get('/inventory/canada-warehouse-stocks', [CanadaWarehouseStockController::class, 'index']);

	Route::get('/api-products', [ApiProductController::class, 'index']);
	Route::post('/api-products/sync', [ApiProductController::class, 'sync']);

	Route::apiResource('/settings', SettingsController::class);
	Route::get('/website/best-sellers-section', [SettingsController::class, 'bestSellersSection']);
	Route::put('/website/best-sellers-section', [SettingsController::class, 'updateBestSellersSection']);

	Route::get('/products', [ProductController::class, 'index']);
	Route::put('/products/reorder', [ProductController::class, 'reorder']);
	Route::get('/products/{product}', [ProductController::class, 'show']);
	Route::post('/products', [ProductController::class, 'store']);
	Route::put('/products/{product}', [ProductController::class, 'update']);
	Route::delete('/products/{product}', [ProductController::class, 'destroy']);

	// Order Management
	Route::get('/orders', [CheckoutOrderController::class, 'index']);
	Route::get('/orders/{checkoutOrder}', [CheckoutOrderController::class, 'show']);
	Route::put('/orders/{checkoutOrder}', [CheckoutOrderController::class, 'update']);
	Route::delete('/orders/{checkoutOrder}', [CheckoutOrderController::class, 'destroy']);
	Route::post('/orders/bulk-update', [CheckoutOrderController::class, 'bulkUpdate']);
	Route::post('/orders/bulk-delete', [CheckoutOrderController::class, 'bulkDelete']);

	// Public API Key Management
	Route::get('/public-api-keys', [PublicApiKeyController::class, 'index']);
	Route::post('/public-api-keys', [PublicApiKeyController::class, 'store']);
	Route::delete('/public-api-keys/{publicApiKey}', [PublicApiKeyController::class, 'destroy']);
	});
	
});


Route::middleware('auth:sanctum')->prefix('external')->group(function () {
	Route::get('/orders-feed', [CheckoutOrderController::class, 'externalIndex']);
    Route::get('/orders/{checkoutOrder}', [CheckoutOrderController::class, 'externalShow']);
});
