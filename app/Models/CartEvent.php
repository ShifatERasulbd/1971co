<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartEvent extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'session_id',
    ];
}