// GTM/GA4-compatible ecommerce dataLayer helpers.
// Product identifier is ALWAYS the product slug across GTM, GA4, Meta Pixel and Clarity.

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

    dataLayer.push({ ecommerce: null });
    dataLayer.push({ event: eventName, ecommerce });
}

// Single source of truth for the product identifier (slug first).
export function getProductSlug(item = {}) {
    return String(item.product_slug || item.slug || item.sku || item.productId || item.id || '');
}

export function getItemPrice(item = {}) {
    return Number(item.priceValue ?? item.price ?? 0) || 0;
}

export function toGaItem(item = {}) {
    const variant = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');

    return {
        item_id: getProductSlug(item),
        item_name: String(item.name || ''),
        price: getItemPrice(item),
        quantity: Number(item.quantity) || 1,
        ...(variant ? { item_variant: variant } : {}),
        ...(item.category ? { item_category: String(item.category) } : {}),
    };
}

export function sumValue(items = []) {
    return items.reduce((sum, item) => sum + getItemPrice(item) * (Number(item.quantity) || 1), 0);
}

export function trackViewItem(product) {
    if (!product) {
        return;
    }

    pushEcommerceEvent('view_item', {
        currency: 'USD',
        value: getItemPrice(product),
        items: [toGaItem({ ...product, quantity: 1 })],
    });
}

export function trackAddToCart(item) {
    if (!item) {
        return;
    }

    pushEcommerceEvent('add_to_cart', {
        currency: 'USD',
        value: getItemPrice(item) * (Number(item.quantity) || 1),
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