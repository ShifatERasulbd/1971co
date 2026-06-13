<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personalization extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'image_path',
        'front_image_path',
        'back_image_path',
        'quantity',
        'unit_price',
        'total_price',
        'order_status',
        'meta',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'meta' => 'array',
    ];
}
