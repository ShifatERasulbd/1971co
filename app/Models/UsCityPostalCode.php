<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsCityPostalCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'state_code',
        'state_name',
        'postal_code',
    ];
}
