<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicApiKey extends Model
{
    protected $fillable = [
        'name',
        'key_hash',
        'key_preview',
        'is_active',
        'created_by',
        'last_used_at',
        'revoked_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];
}
