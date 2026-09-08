<?php

// app/Mail/ThankYouEmail.php
namespace App\Mail;

use App\Models\CheckoutOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ThankYouEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CheckoutOrder $order) {}

    public function build()
    {
        $name = trim($this->order->first_name . ' ' . $this->order->last_name) ?: 'there';

        return $this->subject('Thank You for Your Order — ' . $this->order->order_number)
            ->view('thank-you')
            ->with([
                'name'  => $name,
                'order' => $this->order,
            ]);
    }
}