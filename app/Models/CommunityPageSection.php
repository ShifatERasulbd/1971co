<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityPageSection extends Model
{
    protected $fillable = [
        'key',
        'title',
        'description',
        'content_title',
        'heading',
        'section_description',
        'button_text',
        'button_url',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
