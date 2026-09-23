<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class ReturnRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_number',
        'request_reason',
        'status',
        'additional_text',
        'uploaded_document',
        'wants_size_replacement',
        'item_size_replacements',
        'order_details',
        'userId',
    ];
    protected $casts = [
        'item_size_replacements' => 'array', // Automatically casts JSON to array
    ];
}
