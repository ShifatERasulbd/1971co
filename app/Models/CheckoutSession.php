<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutSession extends Model
{
    protected $fillable = [
        'session_id', 'first_name', 'last_name', 'email', 'phone',
        'address_line_1', 'address_line_2', 'city', 'state', 'postal_code',
        'country', 'notes', 'items', 'subtotal', 'shipping', 'tax', 'total',
        'status', 'order_number', 'ip_address', 'user_agent', 'last_activity_at',
    ];

    protected $casts = [
        'items' => 'array',
        'last_activity_at' => 'datetime',
    ];
}