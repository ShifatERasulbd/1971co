<?php

namespace App\Http\Controllers;

use App\Models\AboutStorySection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AboutStoryController extends Controller
{
    private function ensureSection(): AboutStorySection
    {
        $section = AboutStorySection::query()->first();

        if (!$section) {
            $section = AboutStorySection::query()->create([
                'background_image' => '/uploads/heroes/images/hero1.webp',
                'section_title' => 'The Beginning',
                'title' => 'Why 1971?',
                'description_html' => '<p>"1971" carries deep historical significance representing independence, pride, and cultural identity. It signals that our brand is rooted in Bangladeshi legacy, not copying Western streetwear but redefining its own path.</p><p>The "Co" brings a fresh, youthful street vibe clean, approachable, and contemporary. Together, they represent our mission: heritage meets modern street culture.</p><p>At 1971Co, we believe streetwear is more than clothing. It\'s a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.</p>',
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

    private function toResponse(AboutStorySection $section): array
    {
        return [
            'id' => $section->id,
            'background_image' => $this->resolveAssetUrl($section->background_image),
            'section_title' => $section->section_title,
            'title' => $section->title,
            'description_html' => $section->description_html,
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
            'description_html' => ['nullable', 'string'],
        ]);

        $section = $this->ensureSection();

        if ($request->hasFile('background_image_file')) {
            $this->deleteAssetIfLocal($section->background_image);
            $validated['background_image'] = $this->storeAssetInPublicDir(
                $request->file('background_image_file'),
                'uploads/about/story',
                'about_story_'
            );
        }

        $section->update([
            'background_image' => $validated['background_image'] ?? $section->background_image,
            'section_title' => $validated['section_title'],
            'title' => $validated['title'],
            'description_html' => $validated['description_html'] ?? '',
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
