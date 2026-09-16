<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;

class SitemapController extends Controller
{
    // Dynamic XML sitemap: static routes + every active product, so new
    // products/collections show up automatically without manual edits.
    public function index(): Response
    {
        $urls = [
            ['loc' => url('/home'), 'priority' => '1.0'],
            ['loc' => url('/shop'), 'priority' => '0.9'],
            ['loc' => url('/best-sellers'), 'priority' => '0.8'],
            ['loc' => url('/new-arrivals'), 'priority' => '0.8'],
            ['loc' => url('/about'), 'priority' => '0.5'],
            ['loc' => url('/contact'), 'priority' => '0.5'],
            ['loc' => url('/together-we-grow'), 'priority' => '0.5'],
        ];

        if (Schema::hasColumn('products', 'slug')) {
            $query = Product::query()->whereNotNull('slug');
            if (Schema::hasColumn('products', 'is_active')) {
                $query->where('is_active', true);
            }

            $query->orderByDesc('updated_at')
                ->chunk(500, function ($products) use (&$urls) {
                    foreach ($products as $product) {
                        $urls[] = [
                            'loc' => url('/product-details/' . $product->slug),
                            'lastmod' => optional($product->updated_at)->toAtomString(),
                            'priority' => '0.7',
                        ];
                    }
                });
        }

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
