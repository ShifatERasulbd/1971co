<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class MediaController extends Controller
{
    public function optimize(Request $request)
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:2048'],
            'w' => ['nullable', 'integer', 'min:120', 'max:2600'],
            'h' => ['nullable', 'integer', 'min:120', 'max:2600'],
            'q' => ['nullable', 'integer', 'min:40', 'max:90'],
            'fit' => ['nullable', 'in:contain,cover'],
            'bg' => ['nullable', 'regex:/^[0-9a-fA-F]{6}$/'],
        ]);

        $relativePath = '/' . ltrim((string) $validated['path'], '/');
        $publicAbsolute = public_path(ltrim($relativePath, '/'));

        if (! File::exists($publicAbsolute)) {
            abort(404);
        }

        $realPublic = realpath(public_path());
        $realFile = realpath($publicAbsolute);
        if (! $realPublic || ! $realFile || ! str_starts_with($realFile, $realPublic)) {
            abort(403);
        }

        $allowedLocalPaths = [
            '/uploads/',
            '/cardImage.png',
        ];

        $isAllowed = false;
        foreach ($allowedLocalPaths as $prefix) {
            if (str_starts_with($relativePath, $prefix)) {
                $isAllowed = true;
                break;
            }
        }

        if (! $isAllowed) {
            abort(403);
        }

        $mime = File::mimeType($publicAbsolute) ?: '';
        if (! str_starts_with($mime, 'image/')) {
            return response()->file($publicAbsolute, [
                'Cache-Control' => 'public, max-age=2592000',
            ]);
        }

        if (! function_exists('imagecreatetruecolor') || ! function_exists('imagewebp')) {
            return response()->file($publicAbsolute, [
                'Cache-Control' => 'public, max-age=2592000',
            ]);
        }

        $targetWidth = (int) ($validated['w'] ?? 1400);
        $targetHeight = isset($validated['h']) ? (int) $validated['h'] : null;
        $quality = (int) ($validated['q'] ?? 76);
        $fit = (string) ($validated['fit'] ?? 'contain');
        $backgroundHex = strtolower((string) ($validated['bg'] ?? 'ffffff'));
        $lastModified = File::lastModified($publicAbsolute);

        $cacheDirectory = public_path('uploads/cache/media');
        File::ensureDirectoryExists($cacheDirectory);

        $cacheKey = md5(
            $relativePath
            . '|' . $targetWidth
            . '|' . ($targetHeight ?? 0)
            . '|' . $quality
            . '|' . $fit
            . '|' . $backgroundHex
            . '|' . $lastModified
        );
        $cachedPath = $cacheDirectory . DIRECTORY_SEPARATOR . $cacheKey . '.webp';

        if (! File::exists($cachedPath)) {
            $source = $this->createImageResource($publicAbsolute, strtolower($mime));
            if (! $source) {
                return response()->file($publicAbsolute, [
                    'Cache-Control' => 'public, max-age=2592000',
                ]);
            }

            $sourceWidth = imagesx($source);
            $sourceHeight = imagesy($source);
            if ($sourceWidth <= 0 || $sourceHeight <= 0) {
                imagedestroy($source);
                return response()->file($publicAbsolute, [
                    'Cache-Control' => 'public, max-age=2592000',
                ]);
            }

            if ($targetHeight === null) {
                $scale = min($targetWidth / $sourceWidth, 1);
                $resizedWidth = max(1, (int) floor($sourceWidth * $scale));
                $resizedHeight = max(1, (int) floor($sourceHeight * $scale));

                $target = imagecreatetruecolor($resizedWidth, $resizedHeight);
            } else {
                $resizedWidth = $targetWidth;
                $resizedHeight = $targetHeight;
                $target = imagecreatetruecolor($targetWidth, $targetHeight);
            }

            if (! $target) {
                imagedestroy($source);
                return response()->file($publicAbsolute, [
                    'Cache-Control' => 'public, max-age=2592000',
                ]);
            }

            imagealphablending($target, true);
            imagesavealpha($target, true);

            if ($targetHeight === null) {
                imagecopyresampled(
                    $target,
                    $source,
                    0,
                    0,
                    0,
                    0,
                    $resizedWidth,
                    $resizedHeight,
                    $sourceWidth,
                    $sourceHeight
                );
            } else {
                [$bgRed, $bgGreen, $bgBlue] = $this->hexToRgb($backgroundHex);
                $bgColor = imagecolorallocate($target, $bgRed, $bgGreen, $bgBlue);
                imagefilledrectangle($target, 0, 0, $targetWidth, $targetHeight, $bgColor);

                if ($fit === 'cover') {
                    $scale = max($targetWidth / $sourceWidth, $targetHeight / $sourceHeight);
                } else {
                    $scale = min($targetWidth / $sourceWidth, $targetHeight / $sourceHeight);
                }

                $drawWidth = max(1, (int) floor($sourceWidth * $scale));
                $drawHeight = max(1, (int) floor($sourceHeight * $scale));
                $drawX = (int) floor(($targetWidth - $drawWidth) / 2);
                $drawY = (int) floor(($targetHeight - $drawHeight) / 2);

                imagecopyresampled(
                    $target,
                    $source,
                    $drawX,
                    $drawY,
                    0,
                    0,
                    $drawWidth,
                    $drawHeight,
                    $sourceWidth,
                    $sourceHeight
                );
            }

            $saved = @imagewebp($target, $cachedPath, $quality);

            imagedestroy($target);
            imagedestroy($source);

            if (! $saved || ! File::exists($cachedPath)) {
                return response()->file($publicAbsolute, [
                    'Cache-Control' => 'public, max-age=2592000',
                ]);
            }
        }

        return response()->file($cachedPath, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    private function createImageResource(string $path, string $mime)
    {
        return match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
            'image/gif' => @imagecreatefromgif($path),
            default => null,
        };
    }

    private function hexToRgb(string $hex): array
    {
        $normalized = ltrim(trim($hex), '#');
        if (! preg_match('/^[0-9a-fA-F]{6}$/', $normalized)) {
            return [255, 255, 255];
        }

        return [
            hexdec(substr($normalized, 0, 2)),
            hexdec(substr($normalized, 2, 2)),
            hexdec(substr($normalized, 4, 2)),
        ];
    }
}
