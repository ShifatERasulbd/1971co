<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutGivingBackSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'section_title',
        'title',
        'description',
        'points',
    ];

    protected $casts = [
        'points' => 'array',
    ];
}
