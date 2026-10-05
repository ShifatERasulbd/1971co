<?php

namespace App\Mail;

use App\Models\CheckoutOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CheckoutOrder $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders-no-reply@1971co.com', '1971Co.'),
            replyTo: array_filter([
                $this->order->email ? new Address($this->order->email, trim($this->order->first_name . ' ' . $this->order->last_name)) : null,
            ]),
            subject: 'New Order Received — ' . $this->order->order_number
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'order-notification',
            with: ['order' => $this->order],
        );
    }
}