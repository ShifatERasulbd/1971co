<?php

use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CanadaWarehouseStockController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\AboutHeroController;
use App\Http\Controllers\AboutGivingBackController;
use App\Http\Controllers\AboutMissionController;
use App\Http\Controllers\AboutStoryController;
use App\Http\Controllers\FeaturesController;
use App\Http\Controllers\GrandChildController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\OurStorySectionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\SubCategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware(['web', 'throttle:6,1']);
Route::get('/public/hero', [HeroController::class, 'publicHero']);
Route::get('/public/heroes', [HeroController::class, 'publicHeroes']);
Route::get('/public/about-hero', [AboutHeroController::class, 'publicIndex']);
Route::get('/public/about-story', [AboutStoryController::class, 'publicIndex']);
Route::get('/public/about-mission', [AboutMissionController::class, 'publicIndex']);
Route::get('/public/about-giving-back', [AboutGivingBackController::class, 'publicIndex']);
Route::get('/public/features', [FeaturesController::class, 'publicIndex']);
Route::get('/public/colors', [ColorController::class, 'index']);
Route::get('/public/collections', [CollectionController::class, 'publicIndex']);
Route::get('/public/our-story', [OurStorySectionController::class, 'publicIndex']);
Route::get('/public/products', [ProductController::class, 'publicIndex']);
Route::get('/public/shop-products', [ProductController::class, 'publicShopIndex']);
Route::get('/public/sizes', [SizeController::class, 'index']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/sub-categories', [SubCategoryController::class, 'index']);
Route::get('/public/grand-childs', [GrandChildController::class, 'index']);
Route::get('/public/settings', [SettingsController::class, 'publicLatest']);
Route::get('/public/best-sellers-section', [SettingsController::class, 'publicBestSellersSection']);

Route::middleware('auth:sanctum')->group(function () {
	Route::get('/user', function (Request $request) {
		return response()->json($request->user());
	});

	Route::post('/logout', [AuthController::class, 'logout'])->middleware('web');

	Route::apiResource('/sizes', SizeController::class);
	Route::apiResource('/colors', ColorController::class);
	Route::apiResource('/heroes', HeroController::class);
	Route::get('/about-hero', [AboutHeroController::class, 'index']);
	Route::post('/about-hero', [AboutHeroController::class, 'update']);
	Route::get('/about-story', [AboutStoryController::class, 'index']);
	Route::post('/about-story', [AboutStoryController::class, 'update']);
	Route::get('/about-mission', [AboutMissionController::class, 'index']);
	Route::post('/about-mission', [AboutMissionController::class, 'update']);
	Route::get('/about-giving-back', [AboutGivingBackController::class, 'index']);
	Route::post('/about-giving-back', [AboutGivingBackController::class, 'update']);
	Route::apiResource('/features', FeaturesController::class);

	Route::get('/collections', [CollectionController::class, 'index']);
	Route::put('/collections', [CollectionController::class, 'update']);

	Route::get('/our-story', [OurStorySectionController::class, 'index']);
	Route::post('/our-story', [OurStorySectionController::class, 'update']);

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
	Route::get('/products/{product}', [ProductController::class, 'show']);
	Route::post('/products', [ProductController::class, 'store']);
	Route::put('/products/{product}', [ProductController::class, 'update']);
	Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});
