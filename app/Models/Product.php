<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'available_products',
        'barcode',
        'color',
        'size',
        'description',
        'long_description',
        'additional_information',
        'price',
        'cover_image',
        'image_gallery',
        'variant_rows',
        'color_variant_images',
        'category_id',
        'subcategory_id',
        'grand_child_id',
        'stock',
        'show_on_best_sellers',
    ];

    protected function casts(): array
    {
        return [
            'available_products' => 'array',
            'color' => 'array',
            'image_gallery' => 'array',
            'variant_rows' => 'array',
            'color_variant_images' => 'array',
            'price' => 'decimal:2',
            'stock' => 'integer',
            'show_on_best_sellers' => 'boolean',
        ];
    }
}
