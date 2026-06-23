<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
});

Route::get('/shop', function () {
    return view('home');
});

Route::get('/best-sellers', function () {
    return view('home');
});

Route::get('/collection/{slug}', function () {
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

Route::get('/together-we-grow', function () {
    return view('home');
});

Route::get('/checkout', function () {
    return view('home');
});

Route::get('/order-confirmation', function () {
    return view('home');
});

Route::get('/login', function () {
    return view('home');
});

Route::get('/register', function () {
    return view('home');
});

Route::get('/reset-password/{token}', function () {
    return view('home');
})->name('password.reset');

Route::get('/admin', function () {
    return view('app');
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/{path?}', function () {
        return view('app');
    })->where('path', '.*');
});

