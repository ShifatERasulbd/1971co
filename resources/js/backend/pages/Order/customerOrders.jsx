import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
import { cancelCustomerOrder, fetchCustomerOrders, createReorder } from './api';
import ReturnModal from './ReturnModal';
import ReviewModal from './ReviewModal';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-emerald-100 text-emerald-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-zinc-100 text-zinc-700',
};

const STATUS_OPTIONS = [
    'pending',
    'approved',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
];

function StatusBadge({ status }) {
    const cls = STATUS_COLORS[status] || 'bg-zinc-100 text-zinc-700';

    return (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
            {status}
        </span>
    );
}

function getTrackingNumber(order) {
    return String(
        order?.tracking_number ||
            order?.ups_tracking_number ||
            order?.courier_reference ||
            ''
    ).trim();
}

function buildUpsTrackingUrl(trackingNumber) {
    const value = String(trackingNumber || '').trim();
    if (!value) return '';
    return `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${encodeURIComponent(value)}`;
}

function renderTrackingContent(order) {
    const trackingNumber = getTrackingNumber(order);

    if (trackingNumber) {
        return {
            kind: 'tracking',
            trackingNumber,
            trackingUrl: buildUpsTrackingUrl(trackingNumber),
        };
    }

    const syncStatus = String(order?.courier_sync_status || '').trim().toLowerCase();
    const upsMessage = String(order?.ups_status_message || '').trim();
    const orderStatus = String(order?.status || '').trim().toLowerCase();

    if (syncStatus === 'failed') {
        return {
            kind: 'failed',
            label: 'UPS sync failed',
            message: upsMessage || 'Tracking unavailable for this order.',
        };
    }

    if (['approved', 'processing', 'shipped', 'delivered'].includes(orderStatus)) {
        return {
            kind: 'pending',
            label: 'Pending UPS',
            message: 'Tracking will appear after shipment sync.',
        };
    }

    return { kind: 'none', label: '-' };
}

// Shared tracking display used by both the desktop table and the mobile cards.
function TrackingInfo({ tracking, align = 'center' }) {
    const alignClass = align === 'center' ? 'items-center' : 'items-start';

    if (tracking.kind === 'tracking') {
        return (
            <a
                href={tracking.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all font-mono text-zinc-700 underline-offset-2 hover:underline"
            >
                {tracking.trackingNumber}
            </a>
        );
    }

    if (tracking.kind === 'failed') {
        return (
            <div className={`flex flex-col space-y-0.5 ${alignClass}`}>
                <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                    {tracking.label}
                </span>
                <p className="text-[10px] leading-4 text-zinc-500">{tracking.message}</p>
            </div>
        );
    }

    if (tracking.kind === 'pending') {
        return (
            <div className={`flex flex-col space-y-0.5 ${alignClass}`}>
                <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    {tracking.label}
                </span>
                <p className="text-[10px] leading-4 text-zinc-500">{tracking.message}</p>
            </div>
        );
    }

    return <span className="text-zinc-400">{tracking.label}</span>;
}

function toText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        return String(value.name || value.label || value.value || '').trim();
    }
    return String(value).trim();
}

// Normalizes the different field names the API may use for order line items.
function getOrderItems(order) {
    const raw = order?.items || order?.order_items || order?.products || [];
    if (!Array.isArray(raw)) return [];

    return raw.map((item, index) => ({
        key: item?.id ?? item?.line_id ?? item?.lineId ?? index,
        name: toText(item?.name || item?.product_name || item?.product?.name),
        variant: toText(item?.variant || item?.variant_name || item?.variation),
        color: toText(item?.color || item?.selected_color || item?.selectedColor || item?.variant?.color),
        size: toText(item?.size || item?.selected_size || item?.selectedSize || item?.variant?.size),
        quantity: Number(item?.quantity ?? item?.qty ?? 0),
    }));
}

function OrderItemsList({ order }) {
    const items = getOrderItems(order);

    if (items.length === 0) {
        return <span className="text-zinc-400">-</span>;
    }

    return (
        <ul className="space-y-2 text-left">
            {items.map((item) => (
                <li key={item.key} className="min-w-0">
                    <p className="break-words text-xs font-medium text-zinc-800">
                        {item.name || 'Unnamed product'}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
                        {item.variant ? <span>Variant: {item.variant}</span> : null}
                        {item.color ? <span>Color: {item.color}</span> : null}
                        {item.size ? <span>Size: {item.size}</span> : null}
                        {item.quantity > 0 ? <span>Qty: {item.quantity}</span> : null}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function CustomerOrders() {
    const { setPageTitle, user } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Modal state for returns
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

    // Modal state for reviews
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

    const searchTimer = useRef(null);

    useEffect(() => {
        setPageTitle('My Orders');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;
        setIsLoading(true);

        fetchCustomerOrders({
            page,
            perPage: 20,
            status: filterStatus,
            search,
        })
            .then((data) => {
                if (!cancelled) {
                    setOrders(data.data ?? []);
                    setMeta(data.meta ?? {});
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    toast.error(err.message || 'Failed to load orders');
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [filterStatus, page, search, user]);

    function handleSearchChange(value) {
        setSearchInput(value);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(value.trim());
            setPage(1);
        }, 350);
    }

    function handleFilterStatus(value) {
        setFilterStatus(value);
        setPage(1);
    }

    function reload() {
        fetchCustomerOrders({
            page,
            perPage: 20,
            status: filterStatus,
            search,
        })
            .then((data) => {
                setOrders(data.data ?? []);
                setMeta(data.meta ?? {});
            })
            .catch(() => {});
    }

    function canCustomerCancel(order) {
        if (!['pending', 'approved'].includes(order.status)) {
            return false;
        }
        const createdAt = new Date(order.created_at).getTime();
        if (Number.isNaN(createdAt)) return false;

        const thirtyMinutes = 30 * 60 * 1000;
        return currentTime - createdAt < thirtyMinutes;
    }

    function canCustomerReturn(order) {
        return String(order?.status || '').trim().toLowerCase() === 'delivered';
    }

    function canCustomerReview(order) {
        return String(order?.status || '').trim().toLowerCase() === 'delivered';
    }

    async function handleCustomerCancel(orderId) {
        try {
            await cancelCustomerOrder(orderId);
            toast.success('Order cancelled');
            reload();
        } catch (error) {
            toast.error(error.message || 'Unable to cancel this order');
        }
    }

    function openReturnModal(order) {
        setSelectedOrderForReturn(order);
        setReturnModalOpen(true);
    }

    function openReviewModal(order) {
        setSelectedOrderForReview(order);
        setReviewModalOpen(true);
    }

    async function handleReviewSubmit({ orderId, rating, comment }) {
        console.log('Submitting Review:', { orderId, rating, comment });
    }

    async function fetchSizesFromDatabase() {
        const response = await fetch('/api/public/sizes');
        if (!response.ok) throw new Error('Failed to fetch sizes');
        const data = await response.json();
        return data;
    }

    async function handleReturnSubmit({ orderId, reason, comments, itemSizeReplacements }) {
        console.log('Submitting Return:', { orderId, reason, comments, itemSizeReplacements });
        reload();
    }

    function renderActionButtons(order, { fullWidth = false } = {}) {
        const customerCanCancel = canCustomerCancel(order);
        const customerCanReturn = canCustomerReturn(order);
        const customerCanReview = canCustomerReview(order);
        const sizeClass = fullWidth ? 'flex-1 px-3 py-2' : 'px-2 py-1';

        return (
            <>
                {customerCanReview && (
                    <button
                        onClick={() => openReviewModal(order)}
                        className={`whitespace-nowrap rounded border border-green-300 bg-green-50 text-xs font-medium text-green-700 hover:bg-green-100 ${sizeClass}`}
                    >
                        Review
                    </button>
                )}

                {customerCanReturn && (
                    <button
                        onClick={() => openReturnModal(order)}
                        className={`whitespace-nowrap rounded border border-blue-300 bg-blue-50 text-xs font-medium text-blue-700 hover:bg-blue-100 ${sizeClass}`}
                    >
                        Return
                    </button>
                )}

                <button
                    onClick={() => handleCustomerCancel(order.id)}
                    disabled={!customerCanCancel}
                    className={`whitespace-nowrap rounded border border-red-300 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass}`}
                >
                    Cancel Order
                </button>
            </>
        );
    }

    const lastPage = meta?.last_page ?? 1;
    const tableColSpan = 8;

    return (
        <div className="px-4 pt-6 pb-20 sm:px-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900">My Orders</h1>
                    <p className="mt-0.5 text-sm text-zinc-500">{meta?.total ?? 0} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by order #..."
                    className="h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600 sm:h-9 sm:w-64"
                />

                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterStatus(e.target.value)}
                    className="h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-600 sm:h-9 sm:w-auto"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mobile: card list */}
            <div className="space-y-3 md:hidden">
                {isLoading ? (
                    <div className="rounded border border-zinc-200 bg-white px-4 py-16 text-center text-sm text-zinc-400">
                        Loading…
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded border border-zinc-200 bg-white px-4 py-16 text-center text-sm text-zinc-400">
                        No orders found
                    </div>
                ) : (
                    orders.map((order) => {
                        const tracking = renderTrackingContent(order);

                        return (
                            <article
                                key={order.id}
                                className="rounded border border-zinc-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Order #</p>
                                        <p className="break-all font-mono text-xs text-zinc-800">{order.order_number}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="mt-4 border-t border-zinc-100 pt-3">
                                    <p className="mb-1.5 text-[11px] uppercase tracking-wide text-zinc-400">Products</p>
                                    <OrderItemsList order={order} />
                                </div>

                                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <dt className="text-[11px] uppercase tracking-wide text-zinc-400">Items</dt>
                                        <dd className="mt-0.5 text-zinc-700">{order.items_count}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[11px] uppercase tracking-wide text-zinc-400">Total</dt>
                                        <dd className="mt-0.5 font-medium text-zinc-800">
                                            ${Number(order.total).toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-[11px] uppercase tracking-wide text-zinc-400">Date</dt>
                                        <dd className="mt-0.5 text-xs text-zinc-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 border-t border-zinc-100 pt-3 text-xs">
                                    <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">Tracking #</p>
                                    <TrackingInfo tracking={tracking} align="start" />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {renderActionButtons(order, { fullWidth: true })}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Desktop / tablet: table */}
            <div className="hidden overflow-x-auto rounded border border-zinc-200 bg-white md:block">
                <table className="w-full min-w-[1100px] table-fixed divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="w-[13%] px-3 py-3 text-center font-semibold text-zinc-700">Order #</th>
                            <th className="w-[24%] px-3 py-3 text-left font-semibold text-zinc-700">Products</th>
                            <th className="w-[6%] px-3 py-3 text-center font-semibold text-zinc-700">Items</th>
                            <th className="w-[9%] px-3 py-3 text-center font-semibold text-zinc-700">Total</th>
                            <th className="w-[11%] px-3 py-3 text-center font-semibold text-zinc-700">Status</th>
                            <th className="w-[13%] px-3 py-3 text-center font-semibold text-zinc-700">Tracking #</th>
                            <th className="w-[9%] px-3 py-3 text-center font-semibold text-zinc-700">Date</th>
                            <th className="w-[15%] px-3 py-3 text-center font-semibold text-zinc-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-40 text-center text-zinc-400">
                                    Loading…
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-40 text-center text-zinc-400">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const tracking = renderTrackingContent(order);

                                return (
                                    <tr key={order.id} className="hover:bg-zinc-50">
                                        <td className="px-3 py-3 text-center font-mono text-xs text-zinc-700 break-all">{order.order_number}</td>
                                        <td className="px-3 py-3 align-top">
                                            <OrderItemsList order={order} />
                                        </td>
                                        <td className="px-3 py-3 text-center text-zinc-700">{order.items_count}</td>
                                        <td className="px-3 py-3 text-center font-medium text-zinc-800">
                                            ${Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-3 py-3 text-center text-xs break-all">
                                            <TrackingInfo tracking={tracking} align="center" />
                                        </td>
                                        <td className="px-3 py-3 text-center text-xs text-zinc-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-row flex-wrap items-center justify-center gap-1.5">
                                                {renderActionButtons(order)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
                    <span>
                        Page {meta?.current_page ?? 1} of {lastPage}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-9 rounded border border-zinc-300 px-4 text-xs hover:bg-zinc-50 disabled:opacity-40 sm:h-8 sm:px-3"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= lastPage}
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            className="h-9 rounded border border-zinc-300 px-4 text-xs hover:bg-zinc-50 disabled:opacity-40 sm:h-8 sm:px-3"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Return Modal Component */}
            <ReturnModal
                isOpen={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                order={selectedOrderForReturn}
                fetchAvailableSizes={fetchSizesFromDatabase}
                onSubmit={handleReturnSubmit}
            />

            {/* Review Modal Component */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                order={selectedOrderForReview}
                onSubmit={handleReviewSubmit}
            />
        </div>
    );
}
