<?php

namespace App\Mail;

use App\Models\CheckoutOrder;
use App\Models\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class OrderCancelledEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CheckoutOrder $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders-no-reply@1971co.com', '1971Co'),
            subject: 'Order Cancelled — Order #' . $this->order->order_number
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
            view: 'order-cancelled',
            with: [
                'name'        => $name,
                'order'       => $this->order,
                'header_logo' => $headerLogo,
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