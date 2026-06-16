<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutStorySection extends Model
{
    use HasFactory;

    protected $fillable = [
        'background_image',
        'section_title',
        'title',
        'description_html',
    ];
}
