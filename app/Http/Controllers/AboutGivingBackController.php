<?php

namespace App\Http\Controllers;

use App\Models\AboutGivingBackSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AboutGivingBackController extends Controller
{
    private function ensureSection(): AboutGivingBackSection
    {
        $section = AboutGivingBackSection::query()->first();

        if (!$section) {
            $section = AboutGivingBackSection::query()->create([
                'image' => '/uploads/heroes/images/hero1.webp',
                'section_title' => 'Giving Back',
                'title' => 'Roots Run Deep.',
                'description' => "Every 1971Co garment is crafted in Bangladesh-the birthplace of our heritage and the heart of our production. But our commitment goes beyond manufacturing.\n\nWe actively support community centers across Bangladesh, providing resources for education, skills training, and youth development programs. These centers serve as hubs for local communities, offering opportunities for growth and empowerment.\n\nWhen you wear 1971Co, you are not just wearing quality streetwear. You are supporting the communities that make our vision possible. Every purchase contributes to building stronger, more vibrant communities back home.",
                'points' => [
                    'Education Programs',
                    'Skills Training',
                    'Youth Development',
                ],
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

    private function toResponse(AboutGivingBackSection $section): array
    {
        $points = collect($section->points ?? [])
            ->map(fn ($point) => trim((string) $point))
            ->filter(fn ($point) => $point !== '')
            ->values()
            ->all();

        return [
            'id' => $section->id,
            'image' => $this->resolveAssetUrl($section->image),
            'section_title' => $section->section_title,
            'title' => $section->title,
            'description' => $section->description,
            'points' => $points,
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
        if (is_string($request->input('points'))) {
            $decodedPoints = json_decode($request->input('points'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedPoints)) {
                $request->merge(['points' => $decodedPoints]);
            }
        }

        $validated = $request->validate([
            'image' => ['nullable', 'string'],
            'image_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,avif,svg', 'max:4096'],
            'section_title' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'points' => ['nullable', 'array'],
            'points.*' => ['nullable', 'string', 'max:255'],
        ]);

        $section = $this->ensureSection();

        if ($request->hasFile('image_file')) {
            $this->deleteAssetIfLocal($section->image);
            $validated['image'] = $this->storeAssetInPublicDir(
                $request->file('image_file'),
                'uploads/about/giving-back',
                'about_giving_back_'
            );
        }

        $points = collect($validated['points'] ?? [])
            ->map(fn ($point) => trim((string) $point))
            ->filter(fn ($point) => $point !== '')
            ->values()
            ->all();

        $section->update([
            'image' => $validated['image'] ?? $section->image,
            'section_title' => $validated['section_title'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'points' => $points,
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
