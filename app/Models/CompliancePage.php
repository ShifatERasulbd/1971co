<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompliancePage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'terms_and_conditions',
        'privacy_policy',
        'shipping_and_return',
    ];

    protected function casts(): array
    {
        return [
            'terms_and_conditions' => 'string',
            'privacy_policy' => 'string',
            'shipping_and_return' => 'string',
        ];
    }
}