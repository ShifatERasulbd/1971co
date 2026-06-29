<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'short_description',
        'description',
        'icon',
        'sort_order',
        'columns_per_view',
        'title_font_size',
        'title_font_family',
        'description_font_size',
        'description_font_family',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'columns_per_view' => 'integer',
        'title_font_size' => 'integer',
        'description_font_size' => 'integer',
    ];
}
