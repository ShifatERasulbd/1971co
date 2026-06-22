<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_section_id',
        'name',
        'slug',
        'image',
        'product_ids',
        'sort_order',
    ];

    protected $casts = [
        'product_ids' => 'array',
        'sort_order' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(CollectionSection::class, 'collection_section_id');
    }
}
