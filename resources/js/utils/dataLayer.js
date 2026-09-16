// GTM/GA4-compatible ecommerce dataLayer helpers.
// Every product/cart object here is dynamic (id, name, price, sku, qty) - no
// per-product/manual wiring is needed for new products/variants/orders.

function ensureDataLayer() {
    if (typeof window === 'undefined') {
        return null;
    }

    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
}

function pushEcommerceEvent(eventName, ecommerce) {
    const dataLayer = ensureDataLayer();
    if (!dataLayer) {
        return;
    }

    // Clear the previous ecommerce object first so GTM/GA4 doesn't merge stale
    // items from the last event (recommended by Google's GA4 dataLayer docs).
    dataLayer.push({ ecommerce: null });
    dataLayer.push({ event: eventName, ecommerce });
}

function toGaItem(item = {}) {
    const variant = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');

    return {
        item_id: String(item.sku || item.productId || item.id || ''),
        item_name: String(item.name || ''),
        price: Number(item.priceValue ?? item.price ?? 0) || 0,
        quantity: Number(item.quantity) || 1,
        ...(variant ? { item_variant: variant } : {}),
        ...(item.category ? { item_category: String(item.category) } : {}),
    };
}

function sumValue(items = []) {
    return items.reduce((sum, item) => sum + (Number(item.priceValue ?? item.price ?? 0) || 0) * (Number(item.quantity) || 1), 0);
}

export function trackViewItem(product) {
    if (!product) {
        return;
    }

    pushEcommerceEvent('view_item', {
        currency: 'USD',
        value: Number(product?.priceValue ?? product?.price ?? 0) || 0,
        items: [toGaItem({ ...product, quantity: 1 })],
    });
}

export function trackAddToCart(item) {
    if (!item) {
        return;
    }

    pushEcommerceEvent('add_to_cart', {
        currency: 'USD',
        value: (Number(item.priceValue) || 0) * (Number(item.quantity) || 1),
        items: [toGaItem(item)],
    });
}

export function trackViewCart(items = [], value) {
    pushEcommerceEvent('view_cart', {
        currency: 'USD',
        value: Number.isFinite(Number(value)) ? Number(value) : sumValue(items),
        items: items.map(toGaItem),
    });
}

export function trackBeginCheckout(items = [], value) {
    pushEcommerceEvent('begin_checkout', {
        currency: 'USD',
        value: Number.isFinite(Number(value)) ? Number(value) : sumValue(items),
        items: items.map(toGaItem),
    });
}

export function trackAddShippingInfo(items = [], value, shippingTier) {
    pushEcommerceEvent('add_shipping_info', {
        currency: 'USD',
        value: Number.isFinite(Number(value)) ? Number(value) : sumValue(items),
        ...(shippingTier ? { shipping_tier: String(shippingTier) } : {}),
        items: items.map(toGaItem),
    });
}

export function trackAddPaymentInfo(items = [], value, paymentType) {
    pushEcommerceEvent('add_payment_info', {
        currency: 'USD',
        value: Number.isFinite(Number(value)) ? Number(value) : sumValue(items),
        ...(paymentType ? { payment_type: String(paymentType) } : {}),
        items: items.map(toGaItem),
    });
}

// In-memory guard so a duplicate call within the same page life never re-fires
// purchase for the same order (transaction_id is the permanent Order ID).
const firedPurchaseTransactionIds = new Set();

export function trackPurchase({ transactionId, value, tax = 0, shipping = 0, items = [] } = {}) {
    const id = String(transactionId || '').trim();
    if (!id || firedPurchaseTransactionIds.has(id)) {
        return;
    }

    firedPurchaseTransactionIds.add(id);

    pushEcommerceEvent('purchase', {
        transaction_id: id,
        currency: 'USD',
        value: Number(value) || 0,
        tax: Number(tax) || 0,
        shipping: Number(shipping) || 0,
        items: items.map(toGaItem),
    });
}
