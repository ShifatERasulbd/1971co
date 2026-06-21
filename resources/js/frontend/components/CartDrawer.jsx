import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

function toImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        return fallbackImage;
    }

    if (value.startsWith('http') || value.startsWith('/')) {
        return value;
    }

    return `/${value.replace(/^\/+/, '')}`;
}

export default function CartDrawer() {
    const {
        items,
        isDrawerOpen,
        closeCartDrawer,
        removeFromCart,
        updateQuantity,
        itemCount,
        subtotal,
    } = useCart();

    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
        return () => (document.body.style.overflow = '');
    }, [isDrawerOpen]);

    return (
        <>
            {/* Backdrop */}
            {isDrawerOpen && (
                <button
                    type="button"
                    aria-label="Close cart drawer backdrop"
                    onClick={closeCartDrawer}
                    className="fixed inset-0 z-[110] bg-black/40"
                />
            )}

            {/* Drawer */}
            <aside
                aria-label="Cart drawer"
                className={`
                    fixed top-0 right-0 z-[120]
                    flex h-screen w-full max-w-[420px]
                    flex-col bg-white border-l border-zinc-200 shadow-2xl
                    transition-transform duration-300
                    ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div>
                        <p className="text-[0.75rem] uppercase tracking-[0.16em] text-zinc-500">
                            Your Cart
                        </p>
                        <h2 className="text-[1.2rem] font-semibold text-zinc-900">
                            {itemCount} Items
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={closeCartDrawer}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-300"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Content */}
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <ShoppingBag className="size-10 text-zinc-300" />
                        <p className="mt-3 text-[0.95rem] text-zinc-600">
                            Your cart is empty.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {items.map((item) => (
                            <article
                                key={item.lineId}
                                className="flex gap-3 border border-zinc-200 p-3"
                            >
                                <img
                                    src={toImageUrl(item.image)}
                                    alt={item.name}
                                    className="h-20 w-16 object-cover"
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[0.82rem] font-semibold uppercase">
                                        {item.name}
                                    </h3>

                                    <p className="text-[0.78rem] text-zinc-500">
                                        {item.priceLabel}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center border">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.lineId, item.quantity - 1)
                                                }
                                                className="h-8 w-8 flex items-center justify-center"
                                            >
                                                <Minus className="size-3.5" />
                                            </button>

                                            <span className="px-2 text-sm">
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.lineId, item.quantity + 1)
                                                }
                                                className="h-8 w-8 flex items-center justify-center"
                                            >
                                                <Plus className="size-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.lineId)}
                                            className="text-xs uppercase"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-zinc-200 px-5 py-4">
                    <div className="flex justify-between mb-3">
                        <span>Subtotal</span>
                        <span className="font-semibold">
                            ${subtotal.toFixed(2)}
                        </span>
                    </div>

                    <Link
                        to="/checkout"
                        onClick={closeCartDrawer}
                        className="block w-full bg-zinc-900 text-white text-center py-3 uppercase text-sm"
                    >
                        Checkout
                    </Link>
                </div>
            </aside>
        </>
    );
}