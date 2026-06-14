<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_position',
        'items_per_view',
    ];

    protected $casts = [
        'items_per_view' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CollectionItem::class)->orderBy('sort_order')->orderBy('id');
    }
}
