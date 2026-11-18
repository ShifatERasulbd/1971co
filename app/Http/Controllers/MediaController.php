<?php

namespace App\Http\Controllers;

use App\Services\CatalogImageCache;
use App\Services\WebpImageWriter;
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

        $targetWidth = (int) ($validated['w'] ?? 1400);
        $targetHeight = isset($validated['h']) ? (int) $validated['h'] : null;
        $quality = (int) ($validated['q'] ?? 76);
        $fit = (string) ($validated['fit'] ?? 'contain');
        $backgroundHex = strtolower((string) ($validated['bg'] ?? 'ffffff'));
        $lastModified = File::lastModified($publicAbsolute);

        $cacheKey = md5(
            $relativePath
            . '|' . $targetWidth
            . '|' . ($targetHeight ?? 0)
            . '|' . $quality
            . '|' . $fit
            . '|' . $backgroundHex
            . '|' . $lastModified
            // Copies made before transparency was kept may have black backgrounds; rebuild those
            . (in_array($mime, ['image/jpeg', 'image/jpg'], true) ? '' : '|alpha')
        );
        $cachedPath = public_path('uploads/cache/media') . DIRECTORY_SEPARATOR . $cacheKey . '.webp';

        if (! File::exists($cachedPath)
            && ! WebpImageWriter::write($publicAbsolute, $cachedPath, $targetWidth, $targetHeight, $quality, $fit, $backgroundHex)) {
            return response()->file($publicAbsolute, [
                'Cache-Control' => 'public, max-age=2592000',
            ]);
        }

        return response()->file($cachedPath, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    /**
     * A digital catalogue photo copy that isn't on disk yet ($path = "<path inside uploads>.webp").
     * Once it is saved, the web server sends the file itself and this never runs for it again.
     */
    public function catalogImage(string $path)
    {
        $original = CatalogImageCache::original(substr($path, 0, -strlen('.webp')));
        abort_if($original === null, 404);

        if (CatalogImageCache::isFresh($original) || CatalogImageCache::build($original)) {
            return response()->file(CatalogImageCache::copyPath($original), [
                'Content-Type' => 'image/webp',
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ]);
        }

        // The server can't make WebP images: send the original photo instead
        return response()->file($original, [
            'Cache-Control' => 'public, max-age=2592000',
        ]);
    }
}
