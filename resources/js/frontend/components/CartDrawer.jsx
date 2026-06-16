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

    return (
        <>
            {isDrawerOpen ? (
                <button
                    type="button"
                    aria-label="Close cart drawer backdrop"
                    onClick={closeCartDrawer}
                    className="fixed inset-0 z-[70] bg-black/40"
                />
            ) : null}

            <aside
                className={`cart-drawer-shell fixed right-0 top-0 z-[80] flex h-screen w-full max-w-[420px] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ${
                    isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-label="Cart drawer"
            >
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div>
                        <p className="text-[0.75rem] uppercase tracking-[0.16em] text-zinc-500">Your Cart</p>
                        <h2 className="text-[1.2rem] font-semibold text-zinc-900">{itemCount} Items</h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Close cart drawer"
                        onClick={closeCartDrawer}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                        <ShoppingBag className="size-10 text-zinc-300" />
                        <p className="mt-3 text-[0.95rem] text-zinc-600">Your cart is empty.</p>
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                        {items.map((item) => (
                            <article key={item.lineId} className="flex gap-3 border border-zinc-200 bg-white p-3">
                                <img
                                    src={toImageUrl(item.image)}
                                    alt={item.name}
                                    className="h-20 w-16 object-cover object-center"
                                />

                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-2 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-zinc-900">
                                        {item.name}
                                    </h3>
                                    <p className="mt-1 text-[0.78rem] text-zinc-500">{item.priceLabel}</p>

                                    <div className="mt-1.5 flex flex-wrap gap-2 text-[0.72rem] text-zinc-500">
                                        {item.selectedColor ? <span>Color: {item.selectedColor}</span> : null}
                                        {item.selectedSize ? <span>Size: {item.selectedSize}</span> : null}
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="inline-flex items-center border border-zinc-300">
                                            <button
                                                type="button"
                                                aria-label={`Decrease quantity of ${item.name}`}
                                                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                                className="inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                <Minus className="size-3.5" />
                                            </button>
                                            <span className="inline-flex h-8 min-w-8 items-center justify-center border-x border-zinc-300 px-1 text-[0.78rem] text-zinc-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label={`Increase quantity of ${item.name}`}
                                                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                                className="inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                <Plus className="size-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.lineId)}
                                            className="text-[0.72rem] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="border-t border-zinc-200 px-5 py-4">
                    <div className="mb-3 flex items-center justify-between text-[0.9rem] text-zinc-600">
                        <span>Subtotal</span>
                        <span className="text-[1rem] font-semibold text-zinc-900">${subtotal.toFixed(2)}</span>
                    </div>

                    <Link
                        to="/checkout"
                        onClick={closeCartDrawer}
                        className="inline-flex h-11 w-full items-center justify-center bg-zinc-900 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                    >
                        Checkout
                    </Link>

                    <Link
                        to="/shop"
                        onClick={closeCartDrawer}
                        className="mt-2 inline-flex h-11 w-full items-center justify-center border border-zinc-900 bg-white text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-zinc-900 transition-colors hover:bg-zinc-50"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </aside>
        </>
    );
}
