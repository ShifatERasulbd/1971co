<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Hero extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'title_display_mode',
        'title_font_size',
        'title_font_family',
        'description_font_size',
        'description_font_family',
        'text_offset_x',
        'text_offset_y',
        'title_offset_x',
        'title_offset_y',
        'description_offset_x',
        'description_offset_y',
        'button_offset_x',
        'button_offset_y',
        'button_enabled',
        'button_url',
        'image',
        'video',
    ];

    protected $casts = [
        'title_font_size' => 'integer',
        'description_font_size' => 'integer',
        'text_offset_x' => 'integer',
        'text_offset_y' => 'integer',
        'title_offset_x' => 'integer',
        'title_offset_y' => 'integer',
        'description_offset_x' => 'integer',
        'description_offset_y' => 'integer',
        'button_offset_x' => 'integer',
        'button_offset_y' => 'integer',
        'button_enabled' => 'boolean',
    ];

    protected $appends = [
        'image_url',
        'video_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->normalizeMediaUrl($this->image);
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->normalizeMediaUrl($this->video);
    }

    private function normalizeMediaUrl(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://', '//'])) {
            return $value;
        }

        return url('/' . ltrim($value, '/'));
    }
}
