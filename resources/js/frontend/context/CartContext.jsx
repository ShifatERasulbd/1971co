import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { trackPixelAddToCart, trackPixelInitiateCheckout, trackPixelViewContent } from '../../utils/facebookPixel';
import { trackAddToCart, trackViewCart, trackBeginCheckout } from '../../utils/dataLayer';

const CART_STORAGE_KEY = 'frontend-cart-items-v1';
const CART_SYNCED_USER_KEY = 'frontend-cart-synced-user-v1';
const CART_SYNC_DEBOUNCE_MS = 600;

const CartContext = createContext(null);

function readSyncedUserId() {
    try {
        return window.localStorage.getItem(CART_SYNCED_USER_KEY) || '';
    } catch {
        return '';
    }
}

function writeSyncedUserId(userId) {
    try {
        window.localStorage.setItem(CART_SYNCED_USER_KEY, String(userId));
    } catch {
        // Ignore persistence failures.
    }
}

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
    const slug = String(product?.slug || product?.product_slug || '').trim();
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
        slug,
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
    };
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isServerSyncEnabledRef = useRef(false);
    const syncTimeoutRef = useRef(null);

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

            const isFirstSyncForThisUser = readSyncedUserId() !== String(userId);

            if (isFirstSyncForThisUser) {
                const mergedItems = mergeCartItems(serverItems, localItems);
                setItems(mergedItems);
                pushServerCartItems(mergedItems);
            } else {
                setItems(serverItems);
            }

            writeSyncedUserId(userId);
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

    async function logCartEvent(productId) {
        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            const xsrfToken = readCookie('XSRF-TOKEN');

            const response = await fetch('/api/cart/log-event', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                },
                body: JSON.stringify({ product_id: productId }),
            });

            return await response.json();
        } catch (error) {
            console.error('Failed to log backend cart analytics event:', error);
        }
    }

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

        // 1. Facebook Pixel Tracking
        trackPixelAddToCart(nextItem);

        // 2. GTM DataLayer Tracking
        trackAddToCart(nextItem);

        // 3. Backend Analytics Event Logging to Database
        if (nextItem.productId) {
            logCartEvent(nextItem.productId);
        }

        return nextItem;
    }

    function removeFromCart(lineId) {
        setItems((previous) => previous.filter((item) => item.lineId !== lineId));
    }

    function handleProceedToCheckout() {
        trackPixelInitiateCheckout(items, subtotal);
        trackBeginCheckout(items, subtotal);
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
        trackViewCart(items, subtotal);
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
            handleProceedToCheckout,
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