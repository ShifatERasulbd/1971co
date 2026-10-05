<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0eb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f0eb; padding: 40px 0;">
    <tr>
        <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">

                <!-- Header -->
                <tr>
                    <td style="padding: 32px 40px 16px 40px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td><img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px;"></td>
                                <td align="right"><span style="font-size: 13px; color: #64748b; font-weight: 500;">New Order</span></td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Intro -->
                <tr>
                    <td style="padding: 0 40px 24px 40px;">
                        <h2 style="font-size: 24px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin: 0 0 8px 0;">New order received</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                            Order <strong>#{{ $order->order_number }}</strong> was placed on {{ optional($order->created_at)->format('d M Y, h:i A') }}.
                        </p>
                    </td>
                </tr>

                <!-- Customer -->
                <tr>
                    <td style="padding: 0 40px 24px 40px;">
                        <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin: 0 0 12px 0; letter-spacing: 1px; font-weight: 600;">Customer</h4>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #334155; line-height: 1.6;">
                            <tr>
                                <td width="110" style="color: #64748b; padding-bottom: 4px;">Name</td>
                                <td style="padding-bottom: 4px; font-weight: 500;">{{ $order->first_name }} {{ $order->last_name }}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; padding-bottom: 4px;">Email</td>
                                <td style="padding-bottom: 4px;">{{ $order->email }}</td>
                            </tr>
                            @if(!empty($order->phone))
                            <tr>
                                <td style="color: #64748b; padding-bottom: 4px;">Phone</td>
                                <td style="padding-bottom: 4px;">{{ $order->phone }}</td>
                            </tr>
                            @endif
                            <tr>
                                <td style="color: #64748b; padding-bottom: 4px; vertical-align: top;">Ship to</td>
                                <td style="padding-bottom: 4px;">
                                    {{ $order->address_line_1 }}@if($order->address_line_2), {{ $order->address_line_2 }}@endif<br>
                                    {{ $order->city }}, {{ $order->state }} {{ $order->postal_code }}, {{ $order->country }}
                                </td>
                            </tr>
                            @if(!empty($order->notes))
                            <tr>
                                <td style="color: #64748b; padding-bottom: 4px; vertical-align: top;">Notes</td>
                                <td style="padding-bottom: 4px;">{{ $order->notes }}</td>
                            </tr>
                            @endif
                        </table>
                    </td>
                </tr>

                <!-- Order Summary -->
                <tr>
                    <td style="background-color: #f9f8f6; padding: 32px 40px; border-top: 1px solid #eef0f2;">
                        <h3 style="font-size: 18px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin: 0 0 16px 0;">Items ({{ $order->items_count }})</h3>

                        @if(is_array($order->items) && count($order->items))
                        <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                            @foreach($order->items as $item)
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eef0f2; font-size: 14px; color: #334155;">
                                    <strong style="font-weight: 600; color: #0f172a;">{{ $item['name'] ?? '' }}</strong>
                                    <br>
                                    <span style="font-size: 12px; color: #64748b;">
                                        @if(!empty($item['sku']))SKU: {{ $item['sku'] }} · @endif
                                        @if(!empty($item['selectedColor']))Color: {{ $item['selectedColor'] }} · @endif
                                        @if(!empty($item['selectedSize']))Size: {{ $item['selectedSize'] }} · @endif
                                        Qty: {{ $item['quantity'] ?? 1 }}
                                    </span>
                                </td>
                                <td align="right" valign="middle" style="padding: 12px 0; border-bottom: 1px solid #eef0f2; font-size: 14px; font-weight: 600; color: #0f172a;">
                                    ${{ number_format((float) ($item['priceValue'] ?? 0) * (int) ($item['quantity'] ?? 1), 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </table>
                        @endif

                        <table width="100%" border="0" cellspacing="0" cellpadding="6">
                            <tr>
                                <td style="font-size: 14px; color: #64748b;">Subtotal</td>
                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->subtotal, 2) }}</td>
                            </tr>
                            <tr>
                                <td style="font-size: 14px; color: #64748b;">Shipping</td>
                                <td align="right" style="font-size: 14px; color: #334155;">{{ (float) $order->shipping > 0 ? '$' . number_format((float) $order->shipping, 2) : 'Free' }}</td>
                            </tr>
                            <tr>
                                <td style="font-size: 14px; color: #64748b;">Tax</td>
                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->state_tax, 2) }}</td>
                            </tr>
                            @if((float) $order->stripe_charge > 0)
                            <tr>
                                <td style="font-size: 14px; color: #64748b;">Processing</td>
                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->stripe_charge, 2) }}</td>
                            </tr>
                            @endif
                            <tr>
                                <td style="font-size: 15px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px;">Order Total</td>
                                <td align="right" style="font-size: 15px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px;">${{ number_format((float) $order->total, 2) }}</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Payment -->
                <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #eef0f2; font-size: 13px; color: #64748b; line-height: 1.8;">
                        Payment: {{ ucfirst($order->payment_status ?? '') }} via {{ ucfirst($order->payment_provider ?? '') }}<br>
                        Payment Intent: {{ $order->payment_intent_id }}<br>
                        Status: {{ ucfirst($order->status ?? '') }}
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>