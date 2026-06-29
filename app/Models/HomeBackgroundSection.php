<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeBackgroundSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'background_image',
        'items',
    ];

    protected $casts = [
        'items' => 'array',
    ];
}
