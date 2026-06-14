<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OurStorySection extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_image',
        'story_logo',
        'section_title',
        'title',
        'description',
        'background_color',
        'show_image',
        'show_text',
    ];

    protected $casts = [
        'show_image' => 'boolean',
        'show_text' => 'boolean',
    ];
}
