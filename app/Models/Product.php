<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
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
        'category_id',
        'subcategory_id',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'available_products' => 'array',
            'color' => 'array',
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }
}
