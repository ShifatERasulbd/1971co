import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppContext } from '@/context/AppContext';

import { bulkDeleteOrders, bulkUpdateOrders, fetchOrders } from './api';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped:    'bg-indigo-100 text-indigo-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
    refunded:   'bg-zinc-100 text-zinc-700',
};

function StatusBadge({ status }) {
    const cls = STATUS_COLORS[status] || 'bg-zinc-100 text-zinc-700';
    return (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
            {status}
        </span>
    );
}

export default function Orders() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [orders, setOrders]           = useState([]);
    const [meta, setMeta]               = useState({});
    const [isLoading, setIsLoading]     = useState(true);
    const [page, setPage]               = useState(1);
    const [search, setSearch]           = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selected, setSelected]       = useState(new Set());
    const [bulkStatus, setBulkStatus]   = useState('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [confirmDelete, setConfirmDelete]   = useState(false); // bulk delete confirm
    const searchTimer = useRef(null);

    useEffect(() => {
        setPageTitle('Orders');
    }, [setPageTitle]);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        fetchOrders({ page, perPage: 20, status: filterStatus, search })
            .then((data) => {
                if (cancelled) return;
                setOrders(data.data ?? []);
                setMeta(data.meta ?? {});
            })
            .catch((err) => {
                if (cancelled) return;
                toast.error(err.message || 'Failed to load orders');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [page, filterStatus, search]);

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
        setSelected(new Set());
        // force re-fetch by toggling page state without actual page change
        setPage((p) => p);
        // eslint-disable-next-line no-unused-expressions
        fetchOrders({ page, perPage: 20, status: filterStatus, search })
            .then((data) => {
                setOrders(data.data ?? []);
                setMeta(data.meta ?? {});
            })
            .catch(() => {});
    }

    // --- Selection helpers ---
    function toggleAll(checked) {
        if (checked) {
            setSelected(new Set(orders.map((o) => o.id)));
        } else {
            setSelected(new Set());
        }
    }

    function toggleOne(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    // --- Bulk actions ---
    async function handleBulkStatusUpdate() {
        if (!bulkStatus || selected.size === 0) return;
        setIsBulkUpdating(true);
        try {
            await bulkUpdateOrders([...selected], bulkStatus);
            toast.success('Orders updated');
            setBulkStatus('');
            reload();
        } catch (err) {
            toast.error(err.message || 'Failed to update orders');
        } finally {
            setIsBulkUpdating(false);
        }
    }

    async function handleBulkDelete() {
        setIsBulkUpdating(true);
        try {
            await bulkDeleteOrders([...selected]);
            toast.success('Orders deleted');
            setConfirmDelete(false);
            reload();
        } catch (err) {
            toast.error(err.message || 'Failed to delete orders');
        } finally {
            setIsBulkUpdating(false);
        }
    }

    async function handleBulkCancel() {
        if (selected.size === 0) return;
        setIsBulkUpdating(true);
        try {
            await bulkUpdateOrders([...selected], 'cancelled');
            toast.success('Orders cancelled');
            reload();
        } catch (err) {
            toast.error(err.message || 'Failed to cancel orders');
        } finally {
            setIsBulkUpdating(false);
        }
    }

    const allSelected = orders.length > 0 && selected.size === orders.length;
    const someSelected = selected.size > 0;
    const lastPage = meta?.last_page ?? 1;

    return (
        <div className="px-4 py-6 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900">Orders</h1>
                    <p className="mt-0.5 text-sm text-zinc-500">{meta?.total ?? 0} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by order #, name or email…"
                    className="h-9 w-64 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterStatus(e.target.value)}
                    className="h-9 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-600"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Bulk action bar */}
            {someSelected && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-4 py-2.5">
                    <span className="text-sm font-medium text-zinc-700">{selected.size} selected</span>
                    <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="h-8 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800 outline-none"
                    >
                        <option value="">Set status…</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleBulkStatusUpdate}
                        disabled={!bulkStatus || isBulkUpdating}
                        className="h-8 rounded bg-zinc-800 px-3 text-xs font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
                    >
                        Apply Status
                    </button>
                    <button
                        onClick={handleBulkCancel}
                        disabled={isBulkUpdating}
                        className="h-8 rounded border border-orange-300 bg-orange-50 px-3 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                    >
                        Cancel Orders
                    </button>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        disabled={isBulkUpdating}
                        className="h-8 rounded border border-red-300 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="w-10 px-3 py-3">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    className="h-4 w-4 rounded border-zinc-400 accent-zinc-800"
                                />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Order #</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Customer</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Email</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Items</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Date</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-zinc-400">Loading…</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-zinc-400">No orders found</td>
                            </tr>
                        ) : orders.map((order) => (
                            <tr key={order.id} className="hover:bg-zinc-50">
                                <td className="px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(order.id)}
                                        onChange={() => toggleOne(order.id)}
                                        className="h-4 w-4 rounded border-zinc-400 accent-zinc-800"
                                    />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{order.order_number}</td>
                                <td className="px-4 py-3 text-zinc-800">{order.first_name} {order.last_name}</td>
                                <td className="px-4 py-3 text-zinc-500">{order.email}</td>
                                <td className="px-4 py-3 text-center text-zinc-700">{order.items_count}</td>
                                <td className="px-4 py-3 text-right font-medium text-zinc-800">${Number(order.total).toFixed(2)}</td>
                                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                                <td className="px-4 py-3 text-xs text-zinc-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                                        className="rounded border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                    <span>Page {meta?.current_page ?? 1} of {lastPage}</span>
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

            {/* Bulk delete confirm dialog */}
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selected.size} order{selected.size !== 1 ? 's' : ''}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The selected orders will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
