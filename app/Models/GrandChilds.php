<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class GrandChilds extends Model
{
    //

    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'child_id',
        'category_id',
    ];

    protected $appends = [
        'sub_category_id',
    ];

    public function getSubCategoryIdAttribute()
    {
        return $this->attributes['child_id'] ?? null;
    }

    public function setSubCategoryIdAttribute($value)
    {
        $this->attributes['child_id'] = $value;
    }

    public function subCategory(){
        return $this->belongsTo(SubCategory::class, 'child_id');
    }
    public function category(){
        return $this->belongsTo(Category::class);
    }
}
  