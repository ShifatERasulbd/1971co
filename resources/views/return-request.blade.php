<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Return Request Received</title>
</head>
<body style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f5; color: #18181b; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
           <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px; object-fit: contain;">
        </div>

        <h2 style="font-size: 18px; font-weight: 600;">Hi {{ $name }},</h2>
        
        <p style="font-size: 14px; color: #3f3f46;">
            We have received your return request for order <strong>#{{ $order->order_number }}</strong>.
        </p>

        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Reason:</strong> {{ $returnRequest->request_reason }}</p>
            @if($returnRequest->wants_size_replacement)
                <p style="margin: 4px 0;"><strong>Size Replacement Requested:</strong> {{ ucfirst($returnRequest->wants_size_replacement) }}</p>
            @endif
            @if($returnRequest->additional_text)
                <p style="margin: 4px 0;"><strong>Comments:</strong> {{ $returnRequest->additional_text }}</p>
            @endif
        </div>

        <p style="font-size: 14px; color: #3f3f46;">
            Our team will review your request and get back to you shortly with further instructions.
        </p>

        <p style="font-size: 14px; color: #71717a; margin-top: 24px;">
            Best regards,<br><strong>1971Co Team</strong>
        </p>
    </div>
</body>
</html>