<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class ImageUploadOptimizer
{
    public function storeAsWebp(
        UploadedFile $file,
        string $relativeDirectory,
        string $prefix,
        int $maxWidth = 1920,
        int $maxHeight = 1920,
        int $quality = 82
    ): string {
        $directory = public_path(trim($relativeDirectory, '/'));
        File::ensureDirectoryExists($directory);

        $name = now()->format('YmdHis') . '_' . uniqid($prefix, true);
        $targetRelativePath = '/' . trim($relativeDirectory, '/') . '/' . $name . '.webp';
        $targetAbsolutePath = public_path(ltrim($targetRelativePath, '/'));

        $sourcePath = $file->getRealPath();
        if (! $sourcePath) {
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        $imageInfo = @getimagesize($sourcePath);
        if (! is_array($imageInfo) || ! isset($imageInfo['mime'])) {
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        $sourceImage = $this->createImageResource($sourcePath, strtolower((string) $imageInfo['mime']));
        if (! $sourceImage) {
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        $sourceWidth = imagesx($sourceImage);
        $sourceHeight = imagesy($sourceImage);

        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            imagedestroy($sourceImage);
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        $scale = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight, 1);
        $targetWidth = max(1, (int) floor($sourceWidth * $scale));
        $targetHeight = max(1, (int) floor($sourceHeight * $scale));

        $targetImage = imagecreatetruecolor($targetWidth, $targetHeight);
        if (! $targetImage) {
            imagedestroy($sourceImage);
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        imagealphablending($targetImage, true);
        imagesavealpha($targetImage, true);

        imagecopyresampled(
            $targetImage,
            $sourceImage,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $sourceWidth,
            $sourceHeight
        );

        $saved = imagewebp($targetImage, $targetAbsolutePath, max(40, min($quality, 95)));

        imagedestroy($targetImage);
        imagedestroy($sourceImage);

        if (! $saved || ! File::exists($targetAbsolutePath)) {
            return $this->storeOriginal($file, $relativeDirectory, $prefix);
        }

        return $targetRelativePath;
    }

    private function storeOriginal(UploadedFile $file, string $relativeDirectory, string $prefix): string
    {
        $directory = public_path(trim($relativeDirectory, '/'));
        File::ensureDirectoryExists($directory);

        $extension = strtolower((string) $file->getClientOriginalExtension()) ?: 'bin';
        $filename = now()->format('YmdHis') . '_' . uniqid($prefix, true) . '.' . $extension;
        $file->move($directory, $filename);

        return '/' . trim($relativeDirectory, '/') . '/' . $filename;
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
}
