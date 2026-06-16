<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

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

Route::get('/checkout', function () {
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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api).*$');
});

