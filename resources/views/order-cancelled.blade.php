<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Cancelled</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;overflow:hidden;">
                    <tr>
                        <td style="padding:24px;text-align:center;background:#111;">
                            <img src="{{ $header_logo }}" alt="1971Co" style="max-height:40px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h2 style="margin:0 0 16px;color:#111;">Your order has been cancelled</h2>
                            <p style="color:#333;font-size:15px;line-height:1.5;">
                                Hi {{ $name }},
                            </p>
                            <p style="color:#333;font-size:15px;line-height:1.5;">
                                Your order <strong>#{{ $order->order_number }}</strong> has been cancelled as requested.
                                If you paid by card, any charge will be refunded to your original payment method within
                                9-14 business days.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
                                <tr>
                                    <td style="padding:12px 0;color:#555;font-size:14px;">Order Number</td>
                                    <td style="padding:12px 0;color:#111;font-size:14px;text-align:right;">{{ $order->order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;color:#555;font-size:14px;">Order Total</td>
                                    <td style="padding:12px 0;color:#111;font-size:14px;text-align:right;">${{ number_format((float) $order->total, 2) }}</td>
                                </tr>
                            </table>

                            <p style="color:#333;font-size:15px;line-height:1.5;">
                                If you didn't request this cancellation, or have any questions, please contact us on hello@1971co.com
                            </p>

                            <p style="color:#333;font-size:15px;line-height:1.5;margin-top:24px;">
                                — The 1971Co. Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>