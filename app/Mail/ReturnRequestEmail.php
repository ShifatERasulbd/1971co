<?php

// app/Mail/ReturnRequestEmail.php
namespace App\Mail;

use App\Models\CheckoutOrder;
use App\Models\ReturnRequest;
use App\Models\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ReturnRequestEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CheckoutOrder $order, public ReturnRequest $returnRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('return-request@1971co.com', '1971Co'),
            subject: 'Return Request Received — Order #' . $this->order->order_number
        );
    }

    public function content(): Content
    {
        $name = trim($this->order->first_name . ' ' . $this->order->last_name) ?: 'there';

        $payload = Settings::query()->latest('id')->value('payload');
        $settings = is_array($payload) ? $payload : [];
        $headerLogo = $this->toAbsoluteUrl($settings['header_logo'] ?? null)
            ?? url('/uploads/settings/logos/20260622115243-88d4f3422a.webp');

        return new Content(
            view: 'return-request',
            with: [
                'name'          => $name,
                'order'         => $this->order,
                'returnRequest' => $this->returnRequest,
                'header_logo'   => $headerLogo,
            ],
        );
    }

    private function toAbsoluteUrl(?string $path): ?string
    {
        $path = trim((string) $path);
        if ($path === '') {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', '//'])) {
            return $path;
        }

        return url('/' . ltrim($path, '/'));
    }
}