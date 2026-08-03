<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;
use App\Models\Product;
use App\Models\Settings;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

$normalizeAbsoluteUrl = static function (?string $value): ?string {
    $raw = trim((string) $value);

    if ($raw === '') {
        return null;
    }

    if (Str::startsWith($raw, ['http://', 'https://'])) {
        return $raw;
    }

    return url('/' . ltrim($raw, '/'));
};

$buildShareCardImageUrl = static function (?string $value) use ($normalizeAbsoluteUrl): ?string {
    $raw = trim((string) $value);
    if ($raw === '') {
        return null;
    }

    $path = null;

    if (Str::startsWith($raw, ['http://', 'https://'])) {
        $parsed = parse_url($raw);
        $rawPath = (string) ($parsed['path'] ?? '');

        if ($rawPath === '') {
            return $raw;
        }

        $currentHost = parse_url(url('/'), PHP_URL_HOST);
        $imageHost = $parsed['host'] ?? null;

        if (! $currentHost || ! $imageHost || strtolower((string) $currentHost) !== strtolower((string) $imageHost)) {
            return $raw;
        }

        $path = '/' . ltrim($rawPath, '/');
    } else {
        $path = '/' . ltrim($raw, '/');
    }

    $query = http_build_query([
        'path' => $path,
        'w' => 1200,
        'h' => 630,
        'fit' => 'contain',
        'bg' => 'ffffff',
        'q' => 84,
    ]);

    return url('/media/optimize?' . $query);
};

$resolveDefaultShareImage = static function () use ($normalizeAbsoluteUrl, $buildShareCardImageUrl): string {
    $payload = Settings::query()->latest('id')->value('payload');
    $settings = is_array($payload) ? $payload : [];

    $candidate = $settings['header_logo']
        ?? $settings['footer_logo']
        ?? $settings['favicon']
        ?? '/favicon.ico';

    return $buildShareCardImageUrl($candidate)
        ?? $normalizeAbsoluteUrl($candidate)
        ?? url('/favicon.ico');
};

$resolveProductShareImage = static function (Product $product) use ($normalizeAbsoluteUrl, $buildShareCardImageUrl): ?string {
    $candidates = [];

    if (is_string($product->cover_image) && trim($product->cover_image) !== '') {
        $candidates[] = $product->cover_image;
    }

    if (is_array($product->image_gallery)) {
        foreach ($product->image_gallery as $item) {
            if (is_string($item) && trim($item) !== '') {
                $candidates[] = $item;
            }
        }
    }

    if (is_array($product->color_variant_images)) {
        foreach ($product->color_variant_images as $items) {
            if (! is_array($items)) {
                continue;
            }

            foreach ($items as $item) {
                if (is_string($item) && trim($item) !== '') {
                    $candidates[] = $item;
                }
            }
        }
    }

    foreach ($candidates as $candidate) {
        $shareCard = $buildShareCardImageUrl($candidate);
        if ($shareCard !== null) {
            return $shareCard;
        }

        $resolved = $normalizeAbsoluteUrl($candidate);
        if ($resolved !== null) {
            return $resolved;
        }
    }

    return null;
};

$buildHomeMeta = static function (?Product $product = null) use ($resolveDefaultShareImage, $resolveProductShareImage): array {
    $brand = (string) config('app.name', '1971Co');
    $defaultDescription = 'Discover premium fashion and personalized apparel from ' . $brand . '.';
    $defaultImage = $resolveDefaultShareImage();

    if ($product === null) {
        return [
            'title' => $brand,
            'description' => $defaultDescription,
            'image' => $defaultImage,
            'url' => url()->current(),
            'type' => 'website',
        ];
    }

    $descriptionSource = trim((string) ($product->description ?: $product->long_description ?: $defaultDescription));
    $description = Str::limit(trim(strip_tags($descriptionSource)), 200, '...');

    return [
        'title' => trim((string) ($product->name ?: $brand)),
        'description' => $description !== '' ? $description : $defaultDescription,
        'image' => $resolveProductShareImage($product) ?? $defaultImage,
        'url' => url()->current(),
        'type' => 'product',
    ];
};

$renderHome = static function (?Product $product = null) use ($buildHomeMeta) {
    return view('home', ['meta' => $buildHomeMeta($product)]);
};

Route::get('/media/optimize', [MediaController::class, 'optimize']);

Route::get('/', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/shop', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/best-sellers', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/collection/{slug}', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/new-arrivals', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/product-details/{slug}/{color?}', function () use ($renderHome) {
    $product = null;

    if (Schema::hasColumn('products', 'slug')) {
        $product = Product::query()->where('slug', request()->route('slug'))->first();
    }

    return $renderHome($product);
});

Route::get('/singleProduct', function () use ($renderHome) {
    return $renderHome();
});


Route::get('/about', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/contact', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/together-we-grow', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/checkout', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/order-confirmation', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/login', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/register', function () use ($renderHome) {
    return $renderHome();
});

Route::get('/reset-password/{token}', function () use ($renderHome) {
    return $renderHome();
})->name('password.reset');

Route::get('/admin/{path?}', function () {
    return view('app');
})->where('path', '.*')->name('login');

Route::get('/user/{path?}', function () {
    return view('app');
})->where('path', '.*');

Route::get('/{subCategorySlug}/{grandChildSlug?}', function () use ($renderHome) {
    return $renderHome();
});

