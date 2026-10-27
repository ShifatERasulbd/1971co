<?php

namespace App\Services;

use App\Models\WholesaleInquiry;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class WholesaleInquiryService
{
    public function handle(array $data, ?UploadedFile $file, ?string $ip, ?string $userAgent): WholesaleInquiry
    {
        // 1. Save to the database (private disk, random file name)
        $path = $file ? $file->store('wholesale-inquiries', 'local') : null;

        try {
            $inquiry = WholesaleInquiry::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'category' => $data['category'] ?? null,
                'subject' => $data['subject'] ?? null,
                'message' => $data['message'],
                'attachment_path' => $path,
                'attachment_name' => $file ? $this->safeFileName($file) : null,
                'ip_address' => $ip,
                'user_agent' => $userAgent ? Str::limit($userAgent, 250, '') : null,
            ]);
        } catch (Throwable $e) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }
            throw $e;
        }

        return $inquiry;
    }

    private function safeFileName(UploadedFile $file): string
    {
        $name = preg_replace('/[^\w.\- ]+/u', '_', basename($file->getClientOriginalName()));

        return Str::limit($name, 120, '');
    }
}