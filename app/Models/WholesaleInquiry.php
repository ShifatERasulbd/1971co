<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WholesaleInquiry extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'category',
        'subject',
        'message',
        'attachment_path',
        'attachment_name',
        'ip_address',
        'user_agent',
    ];
}