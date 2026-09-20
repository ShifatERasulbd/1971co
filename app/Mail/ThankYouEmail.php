<?php

// app/Mail/ThankYouEmail.php
namespace App\Mail;

use App\Models\CheckoutOrder;
use App\Models\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ThankYouEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CheckoutOrder $order) {}

    public function build()
    {
        $name = trim($this->order->first_name . ' ' . $this->order->last_name) ?: 'there';

        // Email clients have no base URL, so relative image paths must be made absolute.
        $items = collect($this->order->items ?? [])->map(function ($item) {
            if (is_array($item) && ! empty($item['image'])) {
                $item['image'] = $this->toAbsoluteUrl($item['image']);
            }
            return $item;
        })->all();
        $this->order->items = $items;

        $payload = Settings::query()->latest('id')->value('payload');
        $settings = is_array($payload) ? $payload : [];
        $headerLogo = $this->toAbsoluteUrl($settings['header_logo'] ?? null)
            ?? url('/uploads/settings/logos/20260622115243-88d4f3422a.webp');

        return $this->subject('Thank You for Your Order — ' . $this->order->order_number)
            ->view('thank-you')
            ->with([
                'name'        => $name,
                'order'       => $this->order,
                'header_logo' => $headerLogo,
            ]);
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