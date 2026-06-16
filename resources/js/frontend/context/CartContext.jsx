import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'frontend-cart-items-v1';

const CartContext = createContext(null);

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
        slug: String(product?.slug || '').trim(),
    };
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(CART_STORAGE_KEY);
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setItems(parsed);
            }
        } catch {
            // Keep empty cart when storage is unavailable.
        }
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Ignore persistence failures.
        }
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
