<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWholesaleInquiryRequest;
use App\Mail\WholesaleInquiryMail;
use App\Models\WholesaleInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class WholesaleContactController extends Controller
{
    public function store(StoreWholesaleInquiryRequest $request): JsonResponse
    {
        $success = ['message' => 'Thank you! Your inquiry has been received.'];

        // Honeypot: real users never fill this hidden field; bots do.
        if (filled($request->input('website'))) {
            return response()->json($success, 201);
        }

        $data = $request->validated();
        $file = $request->file('attachment');

        // 1. Save to the database (private disk, random file name)
        $path = $file ? $file->store('wholesale-inquiries', 'local') : null;

        try {
            $inquiry = WholesaleInquiry::create([
                'name'            => $data['name'],
                'email'           => $data['email'],
                'phone'           => $data['phone'] ?? null,
                'category'        => $data['category'] ?? null,
                'subject'         => $data['subject'] ?? null,
                'message'         => $data['message'],
                'attachment_path' => $path,
                'attachment_name' => $file ? $this->safeFileName($file->getClientOriginalName()) : null,
                'ip_address'      => $request->ip(),
                'user_agent'      => $request->userAgent() ? Str::limit($request->userAgent(), 250, '') : null,
            ]);
        } catch (Throwable $e) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }
            throw $e;
        }

        // 2. Send the email AFTER the response, so the visitor never waits on SMTP
        //    and a mail failure can never break the form.
        dispatch(function () use ($inquiry) {
            try {
               Mail::send(new WholesaleInquiryMail($inquiry));
            } catch (Throwable $e) {
                Log::error('Wholesale inquiry email failed', [
                    'inquiry_id' => $inquiry->id,
                    'error'      => $e->getMessage(),
                ]);
            }
        })->afterResponse();

        return response()->json($success, 201);
    }

    private function safeFileName(string $original): string
    {
        $name = preg_replace('/[^\w.\- ]+/u', '_', basename($original));

        return Str::limit($name, 120, '');
    }
}