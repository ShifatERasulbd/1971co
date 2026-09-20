import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
import { cancelCustomerOrder, fetchCustomerOrders, createReorder } from './api';
import ReturnModal from './ReturnModal';

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


// reorder 

// Inside your CustomerOrders component:
async function handleReturnSubmit({ orderId, itemSizeReplacements }) {
    try {
        await createReorder({
            orderId,
            itemSizeReplacements,
        });
        toast.success('Reorder created successfully!');
        reload(); // Refreshes the table to show the new reorder row
    } catch (error) {
        toast.error(error.message || 'Failed to create reorder');
    }
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

    const searchTimer = useRef(null);

    useEffect(() => {
        setPageTitle('My Orders');
    }, [setPageTitle]);

    // Update time every second to enforce the 30-minute customer cancellation window
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

    // Function to fetch available sizes from your Laravel sizes API endpoint
    async function fetchSizesFromDatabase() {
        const response = await fetch('/api/public/sizes');
        if (!response.ok) throw new Error('Failed to fetch sizes');
        const data = await response.json();
        return data;
    }

    async function handleReturnSubmit({ orderId, reason, comments, itemSizeReplacements }) {
        // Implement your submit API integration here, e.g.:
        // await submitCustomerReturn({ orderId, reason, comments, itemSizeReplacements });
        console.log('Submitting Return:', { orderId, reason, comments, itemSizeReplacements });
        reload();
    }

    const lastPage = meta?.last_page ?? 1;
    const tableColSpan = 8;

    return (
        <div className="px-4 py-6 sm:px-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900">My Orders</h1>
                    <p className="mt-0.5 text-sm text-zinc-500">{meta?.total ?? 0} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by order #..."
                    className="h-9 w-64 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600"
                />

                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterStatus(e.target.value)}
                    className="h-9 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-600"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Order #</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Stripe Payment ID</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Items</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Tracking #</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Date</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-10 text-center text-zinc-400">
                                    Loading…
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-10 text-center text-zinc-400">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const tracking = renderTrackingContent(order);
                                const customerCanCancel = canCustomerCancel(order);
                                const customerCanReturn = canCustomerReturn(order);

                                return (
                                    <tr key={order.id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-3 font-mono text-xs text-zinc-700">{order.order_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-zinc-700">{order.stripe_payment_id}</td>
                                        <td className="px-4 py-3 text-center text-zinc-700">{order.items_count}</td>
                                        <td className="px-4 py-3 text-right font-medium text-zinc-800">
                                            ${Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {tracking.kind === 'tracking' ? (
                                                <a
                                                    href={tracking.trackingUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-mono text-zinc-700 underline-offset-2 hover:underline"
                                                >
                                                    {tracking.trackingNumber}
                                                </a>
                                            ) : tracking.kind === 'failed' ? (
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                                                        {tracking.label}
                                                    </span>
                                                    <p className="max-w-[190px] text-[10px] leading-4 text-zinc-500">
                                                        {tracking.message}
                                                    </p>
                                                </div>
                                            ) : tracking.kind === 'pending' ? (
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                                                        {tracking.label}
                                                    </span>
                                                    <p className="text-[10px] leading-4 text-zinc-500">
                                                        {tracking.message}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">{tracking.label}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <button
                                                    onClick={() => handleCustomerCancel(order.id)}
                                                    disabled={!customerCanCancel}
                                                    className="rounded border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>

                                                {customerCanReturn && (
                                                    <button
                                                        onClick={() => openReturnModal(order)}
                                                        className="rounded border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                    >
                                                        Return
                                                    </button>
                                                )}
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
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                    <span>
                        Page {meta?.current_page ?? 1} of {lastPage}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-8 rounded border border-zinc-300 px-3 text-xs hover:bg-zinc-50 disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= lastPage}
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            className="h-8 rounded border border-zinc-300 px-3 text-xs hover:bg-zinc-50 disabled:opacity-40"
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
        </div>
    );
}