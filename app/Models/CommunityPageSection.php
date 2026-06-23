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
        'feature_image',
        'feature_items',
        'community_image',
        'community_items',
        'gallery_items',
        'status',
    ];

    protected $casts = [
        'feature_items' => 'array',
        'community_items' => 'array',
        'gallery_items' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
