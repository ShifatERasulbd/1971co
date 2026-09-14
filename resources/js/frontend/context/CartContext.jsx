import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { trackPixelEvent } from '../../utils/facebookPixel';

const CART_STORAGE_KEY = 'frontend-cart-items-v1';
const CART_SYNC_DEBOUNCE_MS = 600;

const CartContext = createContext(null);

function readCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

async function fetchAuthenticatedUserId() {
    try {
        const response = await fetch('/api/user', {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json().catch(() => null);
        return payload?.id ?? null;
    } catch {
        return null;
    }
}

async function fetchServerCartItems() {
    try {
        const response = await fetch('/api/customer/cart', {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json().catch(() => null);
        return Array.isArray(payload?.items) ? payload.items : [];
    } catch {
        return null;
    }
}

async function pushServerCartItems(items) {
    try {
        await fetch('/sanctum/csrf-cookie', {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });

        const xsrfToken = readCookie('XSRF-TOKEN');

        await fetch('/api/customer/cart', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
            },
            body: JSON.stringify({ items }),
        });
    } catch {
        // Ignore sync failures; localStorage still holds the cart for this device.
    }
}

// Combine the account's server cart with this device's local cart without
// doubling quantities on reload (same lineId on both sides keeps the higher
// quantity instead of summing), while still picking up items added elsewhere.
function mergeCartItems(serverItems, localItems) {
    const merged = new Map();

    for (const item of serverItems) {
        if (item?.lineId) {
            merged.set(item.lineId, item);
        }
    }

    for (const item of localItems) {
        if (!item?.lineId) {
            continue;
        }

        const existing = merged.get(item.lineId);
        if (!existing) {
            merged.set(item.lineId, item);
            continue;
        }

        merged.set(item.lineId, {
            ...existing,
            quantity: Math.max(Number(existing.quantity) || 0, Number(item.quantity) || 0),
        });
    }

    return Array.from(merged.values());
}

function toNumberPrice(value) {
    if (Number.isFinite(Number(value))) {
        return Number(value);
    }

    if (typeof value === 'string') {
        const parsed = Number(value.replace(/[^0-9.\-]/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function normalizeWeightValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value).trim();
    if (!text) {
        return '';
    }

    return text;
}

function parseVariantTokens(value) {
    return String(value || '')
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);
}

function findVariantRowValue(product, selectedColor, selectedSize, selectedSku = '', field = 'weight') {
    const rows = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    if (rows.length === 0) {
        return '';
    }

    const selectedSkuToken = String(selectedSku || '').trim().toLowerCase();
    if (selectedSkuToken) {
        const rowBySku = rows.find((row) => String(row?.sku || '').trim().toLowerCase() === selectedSkuToken);
        if (rowBySku) {
            return normalizeWeightValue(rowBySku?.[field]);
        }
    }

    const selectedColorToken = String(selectedColor || '').trim().toLowerCase();
    const selectedSizeToken = String(selectedSize || '').trim().toLowerCase();

    for (const row of rows) {
        if (!row || typeof row !== 'object') {
            continue;
        }

        const rowColorTokens = parseVariantTokens(row.color);
        const rowSizeTokens = parseVariantTokens(row.size);

        const colorMatches = selectedColorToken ? rowColorTokens.includes(selectedColorToken) : true;
        const sizeMatches = selectedSizeToken ? rowSizeTokens.includes(selectedSizeToken) : true;

        if (colorMatches && sizeMatches) {
            return normalizeWeightValue(row?.[field]);
        }
    }

    return '';
}

function normalizeCartItem(product, options = {}) {
    const productId = String(product?.id || product?.slug || product?.name || Date.now());
    const selectedColor = String(options.selectedColor || '').trim();
    const selectedSize = String(options.selectedSize || '').trim();
    const quantity = Math.max(1, Number(options.quantity) || 1);

    const lineId = [productId, selectedColor || 'default-color', selectedSize || 'default-size'].join('::');

    const image = options.image
        || product?.cover_image
        || (Array.isArray(product?.image_gallery) ? product.image_gallery[0] : '')
        || '';

    const normalizedImage =
        typeof image === 'string' && image
            ? (image.startsWith('http') || image.startsWith('/') ? image : `/${image.replace(/^\/+/, '')}`)
            : '';

    const priceValue = toNumberPrice(product?.priceValue ?? product?.price);
    const variantSku = String(options.sku || '').trim();
    const variantWeight = findVariantRowValue(product, selectedColor, selectedSize, variantSku, 'weight');
    const variantLength = findVariantRowValue(product, selectedColor, selectedSize, variantSku, 'length');
    const variantWidth = findVariantRowValue(product, selectedColor, selectedSize, variantSku, 'width');
    const variantHeight = findVariantRowValue(product, selectedColor, selectedSize, variantSku, 'height');
    const weight = normalizeWeightValue(options.weight)
        || variantWeight
        || normalizeWeightValue(product?.weight);
    const length = normalizeWeightValue(options.length)
        || variantLength
        || normalizeWeightValue(product?.length);
    const width = normalizeWeightValue(options.width)
        || variantWidth
        || normalizeWeightValue(product?.width);
    const height = normalizeWeightValue(options.height)
        || variantHeight
        || normalizeWeightValue(product?.height);

    return {
        lineId,
        productId,
        name: String(product?.name || 'Product').trim() || 'Product',
        priceValue,
        priceLabel: `$${priceValue.toFixed(2)}`,
        image: normalizedImage,
        quantity,
        selectedColor,
        selectedSize,
        sku: variantSku || String(product?.sku || '').trim(),
        weight,
        length,
        width,
        height,
        slug: String(product?.slug || '').trim(),
    };
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isServerSyncEnabledRef = useRef(false);
    const syncTimeoutRef = useRef(null);

    // Load this device's local cart, then reconcile it against the logged-in
    // account's server cart so every device the customer logs into shares one cart.
    useEffect(() => {
        let isCancelled = false;

        function readLocalItems() {
            try {
                const raw = window.localStorage.getItem(CART_STORAGE_KEY);
                if (!raw) {
                    return [];
                }

                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        const localItems = readLocalItems();
        if (localItems.length > 0) {
            setItems(localItems);
        }

        async function reconcileWithServer() {
            const userId = await fetchAuthenticatedUserId();
            if (isCancelled || !userId) {
                return;
            }

            isServerSyncEnabledRef.current = true;

            const serverItems = await fetchServerCartItems();
            if (isCancelled || serverItems === null) {
                return;
            }

            const mergedItems = mergeCartItems(serverItems, localItems);
            setItems(mergedItems);
            pushServerCartItems(mergedItems);
        }

        reconcileWithServer();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Ignore persistence failures.
        }

        if (syncTimeoutRef.current) {
            window.clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = window.setTimeout(() => {
            if (isServerSyncEnabledRef.current) {
                pushServerCartItems(items);
            }
        }, CART_SYNC_DEBOUNCE_MS);

        return () => {
            if (syncTimeoutRef.current) {
                window.clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [items]);

    function addToCart(product, options = {}) {
        const nextItem = normalizeCartItem(product, options);

        setItems((previous) => {
            const index = previous.findIndex((item) => item.lineId === nextItem.lineId);
            if (index < 0) {
                return [...previous, nextItem];
            }

            const updated = [...previous];
            updated[index] = {
                ...updated[index],
                quantity: updated[index].quantity + nextItem.quantity,
            };
            return updated;
        });

        trackPixelEvent('AddToCart', {
            content_ids: [nextItem.productId],
            content_type: 'product',
            content_name: nextItem.name,
            currency: 'USD',
            value: nextItem.priceValue * nextItem.quantity,
        });

        return nextItem;
    }

    function removeFromCart(lineId) {
        setItems((previous) => previous.filter((item) => item.lineId !== lineId));
    }

    function updateQuantity(lineId, quantity) {
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        setItems((previous) =>
            previous.map((item) =>
                item.lineId === lineId
                    ? { ...item, quantity: safeQuantity }
                    : item,
            ),
        );
    }

    function clearCart() {
        setItems([]);
    }

    function openCartDrawer() {
        setIsDrawerOpen(true);
    }

    function closeCartDrawer() {
        setIsDrawerOpen(false);
    }

    const itemCount = useMemo(
        () => items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
        [items],
    );

    const subtotal = useMemo(
        () => items.reduce((total, item) => total + (item.priceValue * item.quantity), 0),
        [items],
    );

    const value = useMemo(
        () => ({
            items,
            isDrawerOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            openCartDrawer,
            closeCartDrawer,
            itemCount,
            subtotal,
        }),
        [items, isDrawerOpen, itemCount, subtotal],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }

    return context;
}
