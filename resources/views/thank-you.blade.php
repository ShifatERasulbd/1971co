{{-- resources/views/thank-you.blade.php --}}
<h2>Hi {{ $name }},</h2>
<p>Thank you for your order! We appreciate your business.</p>
@if($order)
<p>Order #{{ $order->order_number }} — Total: ${{ number_format((float) $order->total, 2) }}</p>

@if(is_array($order->items) && count($order->items))
<table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th align="left" style="border-bottom: 1px solid #ddd;">Item</th>
            <th align="center" style="border-bottom: 1px solid #ddd;">Qty</th>
            <th align="right" style="border-bottom: 1px solid #ddd;">Price</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->items as $item)
        <tr>
            <td style="border-bottom: 1px solid #eee;">
                {{ $item['name'] ?? '' }}
                @if(!empty($item['selectedColor']) || !empty($item['selectedSize']))
                    <br><small>{{ trim(($item['selectedColor'] ?? '') . ' ' . ($item['selectedSize'] ?? '')) }}</small>
                @endif
            </td>
            <td align="center" style="border-bottom: 1px solid #eee;">{{ $item['quantity'] ?? 1 }}</td>
            <td align="right" style="border-bottom: 1px solid #eee;">${{ number_format((float) ($item['priceValue'] ?? 0), 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<p>
    Subtotal: ${{ number_format((float) $order->subtotal, 2) }}<br>
    Shipping: ${{ number_format((float) $order->shipping, 2) }}<br>
    Tax: ${{ number_format((float) $order->state_tax, 2) }}<br>
    <strong>Total: ${{ number_format((float) $order->total, 2) }}</strong>
</p>

<p>
    Shipping to:<br>
    {{ $order->first_name }} {{ $order->last_name }}<br>
    {{ $order->address_line_1 }}@if($order->address_line_2), {{ $order->address_line_2 }}@endif<br>
    {{ $order->city }}, {{ $order->state }} {{ $order->postal_code }}<br>
    {{ $order->country }}
</p>
@endif