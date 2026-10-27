<?php

namespace App\Mail;

use App\Models\Settings;
use App\Models\WholesaleInquiry;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class WholesaleInquiryMail extends Mailable
{
    use SerializesModels;

    public function __construct(public WholesaleInquiry $inquiry) {}

   public function envelope(): Envelope
    {
        $subject = $this->inquiry->subject ?: ($this->inquiry->category ?: 'New inquiry');

        return new Envelope(
            from: new Address('hello@1971co.com', '1971Co.'),
            to: [
                new Address('wholesale@1971co.com'),
                new Address('anik@newatlantic.biz'),
                new Address('it1@arbellafashion.com'),
                new Address('ishak@newatlantic.biz'),
            ],
            replyTo: [new Address($this->inquiry->email, $this->inquiry->name)],
            subject: 'Wholesale Inquiry — ' . $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'wholesale-inquiry',
            with: [
                'inquiry' => $this->inquiry,
            ],
        );
    }

    public function attachments(): array
    {
        $path = $this->inquiry->attachment_path;

        if (! $path || ! Storage::disk('local')->exists($path)) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('local', $path)
                ->as($this->inquiry->attachment_name ?: basename($path)),
        ];
    }
}