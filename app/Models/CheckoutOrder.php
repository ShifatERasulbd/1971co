<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class CheckoutOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
        'payment_provider',
        'payment_status',
        'payment_intent_id',
        'courier_service',
        'courier_reference',
        'courier_sync_status',
        'courier_sync_error',
        'ups_tracking_number',
        'ups_synced_at',
        'shipstation_order_id',
        'shipstation_synced_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'items' => 'array',
            'items_count' => 'integer',
            'subtotal' => 'decimal:2',
            'shipping' => 'decimal:2',
            'total' => 'decimal:2',
            'ups_synced_at' => 'datetime',
            'shipstation_synced_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
