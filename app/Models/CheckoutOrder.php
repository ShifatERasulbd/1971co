<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckoutOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'notes',
        'items_count',
        'subtotal',
        'shipping',
        'total',
        'items',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'items_count' => 'integer',
            'subtotal' => 'decimal:2',
            'shipping' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }
}
