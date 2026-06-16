<?php

namespace App\Http\Controllers;

use App\Models\AboutHeroSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AboutHeroController extends Controller
{
    private function ensureSection(): AboutHeroSection
    {
        $section = AboutHeroSection::query()->first();

        if (!$section) {
            $section = AboutHeroSection::query()->create([
                'background_image' => '/uploads/heroes/images/hero1.webp',
                'section_title' => 'Our Story',
                'title' => 'Heritage. Culture. Style.',
                'description' => 'Redefining streetwear through bold design and authentic self-expression.',
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

        return url('/' . ltrim($asset, '/'));
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
        }
    }

    private function toResponse(AboutHeroSection $section): array
    {
        return [
            'id' => $section->id,
            'background_image' => $this->resolveAssetUrl($section->background_image),
            'section_title' => $section->section_title,
            'title' => $section->title,
            'description' => $section->description,
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
            'background_image' => ['nullable', 'string'],
            'background_image_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,avif,svg', 'max:4096'],
            'section_title' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $section = $this->ensureSection();

        if ($request->hasFile('background_image_file')) {
            $this->deleteAssetIfLocal($section->background_image);
            $validated['background_image'] = $this->storeAssetInPublicDir(
                $request->file('background_image_file'),
                'uploads/about/hero',
                'about_hero_'
            );
        }

        $section->update([
            'background_image' => $validated['background_image'] ?? $section->background_image,
            'section_title' => $validated['section_title'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
