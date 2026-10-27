<?php

namespace App\Mail;

use App\Models\WholesaleApplication;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WholesaleApplicationMail extends Mailable
{
    use SerializesModels;

    public function __construct(public WholesaleApplication $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('wholesale@1971co.com', '1971Co.'),
            to: [
                new Address('wholesale@1971co.com'),
                // new Address('anik@arbellafashion.com'),
                new Address('it1@arbellafashion.com'),
                // new Address('ishak@newatlantic.biz'),
            ],
            replyTo: [new Address($this->application->contact_email, $this->application->contact_name)],
            subject: 'New Wholesale Request — ' . $this->application->company_legal_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'wholesale-application',
            text: 'wholesale-application-text', // plain-text version helps avoid the junk folder
            with: ['application' => $this->application],
        );
    }
}