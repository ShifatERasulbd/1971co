import { CheckCircle2, ReceiptText, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import RelatedProductsSection from '../components/RelatedProductsSection.jsx';
import { featuresFontClass } from '../utils/typography';

function normalizeProductList(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    return [];
}

function formatMoney(value) {
    const next = Number(value);
    return Number.isFinite(next) ? next.toFixed(2) : '0.00';
}

function toImageUrl(path) {
    if (!path || typeof path !== 'string') {
        return '/uploads/heroes/images/hero1.webp';
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

function readCachedInvoice(orderNumber) {
    try {
        const raw = sessionStorage.getItem('lastOrderInvoice') || localStorage.getItem('lastOrderInvoice');
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        const cachedOrderNumber = String(parsed.order_number || '').trim();
        if (orderNumber && cachedOrderNumber && cachedOrderNumber !== String(orderNumber).trim()) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export default function OrderConfirmationPage() {
    const [searchParams] = useSearchParams();
    const orderNumber = searchParams.get('order') || '';
    const cachedInvoice = useMemo(() => readCachedInvoice(orderNumber), [orderNumber]);
    const email = searchParams.get('email') || String(cachedInvoice?.email || '');
    const [order, setOrder] = useState(cachedInvoice || null);
    const [orderError, setOrderError] = useState('');
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        let ignore = false;

        async function loadOrder() {
            if (!orderNumber) {
                if (cachedInvoice) {
                    setOrder(cachedInvoice);
                    setOrderError('');
                    return;
                }

                setOrder(null);
                setOrderError('Order details are unavailable. Please use the confirmation link sent to your email.');
                return;
            }

            try {
                if (!ignore) {
                    setIsLoadingOrder(true);
                    setOrderError('');
                }

                const requestUrl = email
                    ? `/api/public/orders/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`
                    : `/api/public/orders/${encodeURIComponent(orderNumber)}`;

                const response = await fetch(requestUrl, { headers: { Accept: 'application/json' } });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (!ignore) {
                        setOrder(null);
                        setOrderError(String(payload?.message || 'Unable to load order details.'));
                    }
                    return;
                }

                if (!ignore) {
                    setOrder(payload?.order || null);
                }
            } catch {
                if (!ignore) {
                    setOrder(null);
                    setOrderError('Unable to load order details right now.');
                }
            } finally {
                if (!ignore) {
                    setIsLoadingOrder(false);
                }
            }
        }

        loadOrder();

        return () => {
            ignore = true;
        };
    }, [orderNumber, email, cachedInvoice]);

    useEffect(() => {
        let ignore = false;

        async function loadRelatedProducts() {
            try {
                const response = await fetch('/api/public/shop-products', {
                    headers: { Accept: 'application/json' },
                });

                const payload = await response.json().catch(() => ({}));
                const products = response.ok ? normalizeProductList(payload) : [];
                const purchasedIds = new Set(
                    (Array.isArray(order?.items) ? order.items : [])
                        .map((item) => Number(item?.productId || item?.product_id))
                        .filter((id) => Number.isInteger(id) && id > 0),
                );

                const filtered = products.filter((item) => {
                    const id = Number(item?.id);
                    return !(Number.isInteger(id) && purchasedIds.has(id));
                });

                if (!ignore) {
                    setRelatedProducts(filtered.slice(0, 4));
                }
            } catch {
                if (!ignore) {
                    setRelatedProducts([]);
                }
            }
        }

        loadRelatedProducts();

        return () => {
            ignore = true;
        };
    }, [order?.items]);

    const invoiceItems = useMemo(
        () => (Array.isArray(order?.items) ? order.items : []),
        [order?.items],
    );

    const createdDate = useMemo(() => {
        if (!order?.created_at) {
            return '-';
        }

        const parsed = new Date(order.created_at);
        if (Number.isNaN(parsed.getTime())) {
            return '-';
        }

        return parsed.toLocaleString();
    }, [order?.created_at]);

    return (
        <>
        <section className={`${featuresFontClass} bg-[#f7f7f5] px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto w-full max-w-[1200px] space-y-8">
                <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-10 lg:px-14">
                <div className="flex items-start gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-7" />
                    </div>

                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Order Confirmed</p>
                        <h1 className="mt-2 font-serif text-[2.2rem] uppercase tracking-[0.03em] text-zinc-900 sm:text-[2.8rem]">
                            Thank you for your order
                        </h1>
                        <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-zinc-600">
                            Your order has been placed successfully. We&apos;ll prepare it for processing and you&apos;ll receive updates shortly.
                        </p>

                        {orderNumber ? (
                            <div className="mt-6 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
                                Order number: <span className="ml-2 font-semibold text-zinc-900">{orderNumber}</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Link
                        to="/shop"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded bg-zinc-900 px-6 text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                    >
                        <ShoppingBag className="size-4" />
                        Continue Shopping
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex h-12 items-center justify-center rounded border border-zinc-300 px-6 text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-zinc-900 transition-colors hover:border-zinc-900 hover:bg-zinc-50"
                    >
                        Shop More
                    </Link>
                </div>

                {isLoadingOrder ? (
                    <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-6 text-sm text-zinc-600">
                        Loading full order invoice...
                    </div>
                ) : order ? (
                    <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                            <h2 className="inline-flex items-center gap-2 text-[1.1rem] font-semibold uppercase tracking-[0.08em] text-zinc-900">
                                <ReceiptText className="size-5" />
                                Invoice
                            </h2>
                            <span className="text-sm text-zinc-600">Generated on {createdDate}</span>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
                            <p><span className="font-semibold text-zinc-900">Order:</span> {order.order_number || '-'}</p>
                            <p><span className="font-semibold text-zinc-900">Status:</span> {order.status || '-'}</p>
                            <p><span className="font-semibold text-zinc-900">Courier:</span> {order.courier_service || '-'}</p>
                            <p><span className="font-semibold text-zinc-900">Tracking:</span> {order.courier_reference || '-'}</p>
                        </div>

                        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                            <div className="rounded border border-zinc-200 bg-white p-4">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Customer</h3>
                                <p className="mt-2 font-medium text-zinc-900">{order.first_name} {order.last_name}</p>
                                <p className="text-zinc-700">{order.email}</p>
                                <p className="text-zinc-700">{order.phone || '-'}</p>
                            </div>
                            <div className="rounded border border-zinc-200 bg-white p-4">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Shipping Address</h3>
                                <p className="mt-2 text-zinc-900">{order.address_line_1 || '-'}</p>
                                {order.address_line_2 ? <p className="text-zinc-900">{order.address_line_2}</p> : null}
                                <p className="text-zinc-900">{[order.city, order.state, order.postal_code].filter(Boolean).join(', ') || '-'}</p>
                                <p className="text-zinc-900">{order.country || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-6 overflow-x-auto rounded border border-zinc-200 bg-white">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.12em] text-zinc-500">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((item, index) => {
                                        const qty = Number(item?.quantity || 1);
                                        const price = Number(item?.priceValue || 0);
                                        const lineTotal = Number.isFinite(price) && Number.isFinite(qty) ? price * qty : 0;

                                        return (
                                            <tr key={`${item?.lineId || item?.productId || 'line'}-${index}`} className="border-b border-zinc-100 last:border-b-0">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={toImageUrl(item?.image || '')}
                                                            alt={String(item?.name || 'Product')}
                                                            className="h-14 w-12 rounded object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-zinc-900">{item?.name || 'Product'}</p>
                                                            <p className="text-xs text-zinc-500">
                                                                {[item?.selectedColor ? `Color: ${item.selectedColor}` : '', item?.selectedSize ? `Size: ${item.selectedSize}` : '']
                                                                    .filter(Boolean)
                                                                    .join(' | ') || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-700">{qty}</td>
                                                <td className="px-4 py-3 text-zinc-700">${formatMoney(price)}</td>
                                                <td className="px-4 py-3 font-medium text-zinc-900">${formatMoney(lineTotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="ml-auto mt-6 w-full max-w-[320px] space-y-2 text-sm text-zinc-700">
                            <div className="flex items-center justify-between">
                                <span>Subtotal</span>
                                <span>${formatMoney(order.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Shipping</span>
                                <span>${formatMoney(order.shipping)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-[1rem] font-semibold text-zinc-900">
                                <span>Total</span>
                                <span>${formatMoney(order.total)}</span>
                            </div>
                        </div>
                    </div>
                ) : orderError ? (
                    <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
                        {orderError}
                    </div>
                ) : null}
                </div>
            </div>
        </section>

        <RelatedProductsSection products={relatedProducts} />
        </>
    );
}
