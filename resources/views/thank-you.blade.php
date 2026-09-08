<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #0f172a; padding: 32px 40px;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">1971co</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Hi {{ $name }},</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;">
                                Thank you for your order! We’re getting everything packed up and ready to go. Here are the details of your purchase:
                            </p>

                            @if($order)
                            <!-- Order Badge -->
                            <div style="background-color: #f1f5f9; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <span style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Order Number</span><br>
                                            <strong style="font-size: 16px; color: #0f172a;">#{{ $order->order_number }}</strong>
                                        </td>
                                        <td align="right">
                                            <span style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Total Amount</span><br>
                                            <strong style="font-size: 16px; color: #0f172a;">${{ number_format((float) $order->total, 2) }}</strong>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            @if(is_array($order->items) && count($order->items))
                            <!-- Items Table -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                                <thead>
                                    <tr>
                                        <th align="left" style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Item</th>
                                        <th align="center" style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Qty</th>
                                        <th align="right" style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($order->items as $item)
                                    <tr>
                                        <td style="padding: 14px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
                                            <strong>{{ $item['name'] ?? '' }}</strong>
                                            @if(!empty($item['selectedColor']) || !empty($item['selectedSize']))
                                                <br><span style="font-size: 12px; color: #64748b;">{{ trim(($item['selectedColor'] ?? '') . ' ' . ($item['selectedSize'] ?? '')) }}</span>
                                            @endif
                                        </td>
                                        <td align="center" style="padding: 14px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
                                            {{ $item['quantity'] ?? 1 }}
                                        </td>
                                        <td align="right" style="padding: 14px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
                                            ${{ number_format((float) ($item['priceValue'] ?? 0), 2) }}
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                            @endif

                            <!-- Summary & Shipping Info Grid -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                <tr>
                                    <!-- Shipping Address -->
                                    <td width="50%" valign="top" style="padding-right: 16px;">
                                        <h4 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px 0; letter-spacing: 0.5px;">Shipping Address</h4>
                                        <p style="font-size: 14px; line-height: 1.5; color: #334155; margin: 0;">
                                            {{ $order->first_name }} {{ $order->last_name }}<br>
                                            {{ $order->address_line_1 }}@if($order->address_line_2), {{ $order->address_line_2 }}@endif<br>
                                            {{ $order->city }}, {{ $order->state }} {{ $order->postal_code }}<br>
                                            {{ $order->country }}
                                        </p>
                                    </td>
                                    <!-- Totals Breakdown -->
                                    <td width="50%" valign="top" style="padding-left: 16px;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="6">
                                            <tr>
                                                <td style="font-size: 14px; color: #64748b;">Subtotal:</td>
                                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->subtotal, 2) }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #64748b;">Shipping:</td>
                                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->shipping, 2) }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #64748b;">Tax:</td>
                                                <td align="right" style="font-size: 14px; color: #334155;">${{ number_format((float) $order->state_tax, 2) }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 15px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 8px;">Total:</td>
                                                <td align="right" style="font-size: 15px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 8px;">${{ number_format((float) $order->total, 2) }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                                If you have any questions, feel free to reply directly to this email. Thanks again for shopping with us!
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f8fafc; padding: 24px; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                                &copy; {{ date('Y') }} 1971co. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>