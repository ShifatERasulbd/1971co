<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutMissionSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'background_image',
        'title',
        'description',
        'items',
    ];

    protected $casts = [
        'items' => 'array',
    ];
}
