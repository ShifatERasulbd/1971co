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
        'fit',
        'fabric_and_care',
        'product_features',
        'product_composition',
        'long_description',
        'additional_information',
        'price',
        'cover_image',
        'size_chart_image',
        'size_chart_images',
        'image_gallery',
        'product_videos',
        'variant_rows',
        'color_variant_images',
        'color_variant_videos',
        'color_variant_size_charts',
        'category_id',
        'subcategory_id',
        'grand_child_id',
        'stock',
        'position',
        'show_on_best_sellers',
    ];

    protected function casts(): array
    {
        return [
            'available_products' => 'array',
            'color' => 'array',
            'product_features' => 'array',
            'image_gallery' => 'array',
            'size_chart_images' => 'array',
            'product_videos' => 'array',
            'variant_rows' => 'array',
            'color_variant_images' => 'array',
            'color_variant_videos' => 'array',
            'color_variant_size_charts' => 'array',
            'price' => 'decimal:2',
            'stock' => 'integer',
            'position' => 'integer',
            'show_on_best_sellers' => 'boolean',
        ];
    }
}
