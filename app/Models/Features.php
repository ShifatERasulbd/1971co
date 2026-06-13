<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Features extends Model
{
    use HasFactory;

    protected $fillable =[
        'title',
        'description',
        'icon',
        'sort_order',
        'title_font_size',
        'title_font_family',
        'description_font_size',
        'description_font_family',
    ];
}
 