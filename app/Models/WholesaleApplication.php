<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WholesaleApplication extends Model
{
    protected $fillable = [
        'company_legal_name', 'dba', 'owner_name', 'website',
        'contact_name', 'contact_designation', 'contact_email', 'contact_phone',
        'street_address', 'city', 'state',
        'primary_goods', 'years_in_business', 'physical_stores',
        'projected_year_1', 'projected_year_2', 'projected_year_3',
        'store_description', 'status', 'ip_address', 'user_agent',
    ];
}