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
        'sub_category_id',
        'category_id',
    ];

    public function subCategory(){
        return $this->belongsTo(SubCategory::class);
    }
    public function category(){
        return $this->belongsTo(Category::class);
    }
}
  