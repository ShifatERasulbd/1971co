<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class WebpImageWriter
{
    /**
     * Saves a resized WebP copy of an image at $targetPath.
     * Without $height it scales the photo down to $width and keeps its transparency;
     * with $height it fits the photo into that box ($fit contain/cover) on a $background colour.
     * Returns false when the server can't make WebP images or can't read the source.
     */
    public static function write(
        string $sourcePath,
        string $targetPath,
        int $width,
        ?int $height = null,
        int $quality = 76,
        string $fit = 'contain',
        string $background = 'ffffff',
    ): bool {
        if (! function_exists('imagecreatetruecolor') || ! function_exists('imagewebp')) {
            return false;
        }

        $source = self::open($sourcePath, strtolower((string) File::mimeType($sourcePath)));
        if (! $source) {
            return false;
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            imagedestroy($source);
            return false;
        }

        if ($height === null) {
            $scale = min($width / $sourceWidth, 1);
            $targetWidth = max(1, (int) floor($sourceWidth * $scale));
            $targetHeight = max(1, (int) floor($sourceHeight * $scale));
        } else {
            $targetWidth = $width;
            $targetHeight = $height;
        }

        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        if (! $target) {
            imagedestroy($source);
            return false;
        }

        // A plain resize keeps the photo's transparency (a new GD canvas starts opaque black);
        // a fixed-size box paints the background colour first and blends the photo onto it.
        imagealphablending($target, $height !== null);
        imagesavealpha($target, true);

        if ($height === null) {
            imagefill($target, 0, 0, imagecolorallocatealpha($target, 0, 0, 0, 127));
            imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);
        } else {
            [$red, $green, $blue] = self::hexToRgb($background);
            imagefilledrectangle($target, 0, 0, $targetWidth, $targetHeight, imagecolorallocate($target, $red, $green, $blue));

            $scale = $fit === 'cover'
                ? max($targetWidth / $sourceWidth, $targetHeight / $sourceHeight)
                : min($targetWidth / $sourceWidth, $targetHeight / $sourceHeight);
            $drawWidth = max(1, (int) floor($sourceWidth * $scale));
            $drawHeight = max(1, (int) floor($sourceHeight * $scale));

            imagecopyresampled(
                $target,
                $source,
                (int) floor(($targetWidth - $drawWidth) / 2),
                (int) floor(($targetHeight - $drawHeight) / 2),
                0,
                0,
                $drawWidth,
                $drawHeight,
                $sourceWidth,
                $sourceHeight
            );
        }

        // Written under a temporary name and then renamed, so a half-written file is never sent
        File::ensureDirectoryExists(dirname($targetPath));
        $temporaryPath = $targetPath . '.' . Str::random(8) . '.tmp';
        $saved = @imagewebp($target, $temporaryPath, $quality);

        imagedestroy($target);
        imagedestroy($source);

        if (! $saved || ! File::exists($temporaryPath) || ! @rename($temporaryPath, $targetPath)) {
            @unlink($temporaryPath);

            // Another request may have saved the same copy at the same moment
            return File::exists($targetPath);
        }

        return true;
    }

    private static function open(string $path, string $mime)
    {
        return match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
            'image/gif' => @imagecreatefromgif($path),
            default => null,
        };
    }

    private static function hexToRgb(string $hex): array
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
