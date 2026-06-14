<?php

namespace App\Http\Controllers;

use App\Models\OurStorySection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class OurStorySectionController extends Controller
{
    private function ensureSection(): OurStorySection
    {
        $section = OurStorySection::query()->first();

        if (!$section) {
            $section = OurStorySection::query()->create([
                'story_image' => '/uploads/heroes/images/hero1.webp',
                'story_logo' => null,
                'section_title' => 'Our Story',
                'title' => 'Heritage, Refined.',
                'description' => '1971Co blends cultural identity with modern streetwear discipline - built to feel confident without shouting. Our pieces are designed for those who value restraint over noise, quality over quantity.',
                'background_color' => '#c8b89a',
                'show_image' => true,
                'show_text' => true,
            ]);
        }

        return $section;
    }

    private function resolveAssetUrl(?string $asset): ?string
    {
        if (!$asset) {
            return null;
        }

        if (
            str_starts_with($asset, 'http://') ||
            str_starts_with($asset, 'https://') ||
            str_starts_with($asset, '/') ||
            str_starts_with($asset, 'data:')
        ) {
            return $asset;
        }

        if (File::exists(public_path($asset))) {
            return '/' . ltrim($asset, '/');
        }

        return Storage::url($asset);
    }

    private function storeAssetInPublicDir($uploadedFile, string $folder, string $prefix): string
    {
        $directory = public_path($folder);
        File::ensureDirectoryExists($directory);

        $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'png');
        $filename = time() . '_' . uniqid($prefix, true) . '.' . $extension;
        $uploadedFile->move($directory, $filename);

        return trim($folder, '/') . '/' . $filename;
    }

    private function deleteAssetIfLocal(?string $assetPath): void
    {
        if (!$assetPath) {
            return;
        }

        if (
            str_starts_with($assetPath, 'http://') ||
            str_starts_with($assetPath, 'https://') ||
            str_starts_with($assetPath, 'data:')
        ) {
            return;
        }

        $publicFile = public_path(ltrim($assetPath, '/'));
        if (File::exists($publicFile)) {
            @unlink($publicFile);
            return;
        }

        Storage::disk('public')->delete($assetPath);
    }

    private function toResponse(OurStorySection $section): array
    {
        return [
            'id' => $section->id,
            'story_image' => $this->resolveAssetUrl($section->story_image),
            'story_logo' => $this->resolveAssetUrl($section->story_logo),
            'section_title' => $section->section_title,
            'title' => $section->title,
            'description' => $section->description,
            'background_color' => $section->background_color,
            'show_image' => (bool) $section->show_image,
            'show_text' => (bool) $section->show_text,
        ];
    }

    public function index(): JsonResponse
    {
        $section = $this->ensureSection();

        return response()->json($this->toResponse($section));
    }

    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'story_image' => ['nullable', 'string'],
            'story_logo' => ['nullable', 'string'],
            'story_image_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg', 'max:4096'],
            'story_logo_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg,avif', 'max:4096'],
            'section_title' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'background_color' => ['required', 'regex:/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'show_image' => ['required', 'boolean'],
            'show_text' => ['required', 'boolean'],
        ]);

        $section = $this->ensureSection();

        if ($request->hasFile('story_image_file')) {
            $this->deleteAssetIfLocal($section->story_image);
            $validated['story_image'] = $this->storeAssetInPublicDir(
                $request->file('story_image_file'),
                'uploads/our-story/images',
                'story_image_'
            );
        }

        if ($request->hasFile('story_logo_file')) {
            $this->deleteAssetIfLocal($section->story_logo);
            $validated['story_logo'] = $this->storeAssetInPublicDir(
                $request->file('story_logo_file'),
                'uploads/our-story/logos',
                'story_logo_'
            );
        }

        unset($validated['story_image_file'], $validated['story_logo_file']);

        $section->update([
            'story_image' => $validated['story_image'] ?? $section->story_image,
            'story_logo' => $validated['story_logo'] ?? $section->story_logo,
            'section_title' => $validated['section_title'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'background_color' => $validated['background_color'],
            'show_image' => (bool) $validated['show_image'],
            'show_text' => (bool) $validated['show_text'],
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
