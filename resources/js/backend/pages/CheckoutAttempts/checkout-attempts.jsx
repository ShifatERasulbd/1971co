import { Fragment, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
import { fetchCheckoutAttempts } from './api';

const STATUS_OPTIONS = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'abandoned', label: 'Abandoned' },
    { value: 'completed', label: 'Completed' },
];

const STATUS_COLORS = {
    in_progress: 'bg-blue-100 text-blue-800',
    abandoned: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
};

const STATUS_LABELS = {
    in_progress: 'In Progress',
    abandoned: 'Abandoned',
    completed: 'Completed',
};

// in_progress with no activity for over 1 hour is shown as abandoned
function getDisplayStatus(attempt) {
    if (attempt.status === 'completed') return 'completed';
    const last = attempt.last_activity_at ? new Date(attempt.last_activity_at).getTime() : 0;
    return Date.now() - last > 60 * 60 * 1000 ? 'abandoned' : 'in_progress';
}

function StatusBadge({ status }) {
    const cls = STATUS_COLORS[status] || 'bg-zinc-100 text-zinc-700';
    return (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

export default function AdminCheckoutAttempts() {
    const { setPageTitle, user } = useAppContext();

    const [attempts, setAttempts] = useState([]);
    const [meta, setMeta] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const searchTimer = useRef(null);

    useEffect(() => {
        setPageTitle('Checkout Attempts');
    }, [setPageTitle]);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;
        setIsLoading(true);

        fetchCheckoutAttempts({ page, perPage: 20, status: filterStatus, search })
            .then((data) => {
                if (!cancelled) {
                    setAttempts(data.data ?? []);
                    setMeta(data.meta ?? {});
                }
            })
            .catch((err) => {
                if (!cancelled) toast.error(err.message || 'Failed to load checkout attempts');
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

    const lastPage = meta?.last_page ?? 1;
    const tableColSpan = 10;

    return (
        <div className="px-4 py-6 sm:px-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-zinc-900">Checkout Attempts</h1>
                <p className="mt-0.5 text-sm text-zinc-500">{meta?.total ?? 0} total attempts</p>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name, email, phone or order #…"
                    className="h-9 w-72 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600"
                />

                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterStatus(e.target.value)}
                    className="h-9 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-600"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Customer</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Email</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Phone</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Location</th>
                            <th className="px-4 py-3 text-center font-semibold text-zinc-700">Items</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Order #</th>
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700">Last Activity</th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-10 text-center text-zinc-400">
                                    Loading…
                                </td>
                            </tr>
                        ) : attempts.length === 0 ? (
                            <tr>
                                <td colSpan={tableColSpan} className="px-4 py-10 text-center text-zinc-400">
                                    No checkout attempts found
                                </td>
                            </tr>
                        ) : (
                            attempts.map((attempt) => {
                                const items = Array.isArray(attempt.items) ? attempt.items : [];
                                const name = `${attempt.first_name || ''} ${attempt.last_name || ''}`.trim();
                                const location = [attempt.city, attempt.state, attempt.country]
                                    .filter(Boolean)
                                    .join(', ');
                                const isOpen = expandedId === attempt.id;

                                return (
                                    <Fragment key={attempt.id}>
                                        <tr className="hover:bg-zinc-50">
                                            <td className="px-4 py-3 text-zinc-800">{name || '-'}</td>
                                            <td className="px-4 py-3 text-zinc-500">{attempt.email || '-'}</td>
                                            <td className="px-4 py-3 text-zinc-500">{attempt.phone || '-'}</td>
                                            <td className="px-4 py-3 text-zinc-500">{location || '-'}</td>
                                            <td className="px-4 py-3 text-center text-zinc-700">{items.length}</td>
                                            <td className="px-4 py-3 text-right font-medium text-zinc-800">
                                                ${Number(attempt.total || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={getDisplayStatus(attempt)} />
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                                                {attempt.order_number || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-zinc-500">
                                                {attempt.last_activity_at
                                                    ? new Date(attempt.last_activity_at).toLocaleString()
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setExpandedId(isOpen ? null : attempt.id)}
                                                    className="rounded border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                                                >
                                                    {isOpen ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>

                                        {isOpen && (
                                            <tr className="bg-zinc-50">
                                                <td colSpan={tableColSpan} className="px-4 py-4">
                                                    <div className="grid gap-6 md:grid-cols-2">
                                                        <div>
                                                            <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                                                                Cart Items
                                                            </h3>
                                                            {items.length === 0 ? (
                                                                <p className="text-xs text-zinc-400">No items</p>
                                                            ) : (
                                                                <ul className="space-y-2">
                                                                    {items.map((item, idx) => (
                                                                        <li
                                                                            key={item.lineId || idx}
                                                                            className="flex items-center gap-3 text-xs text-zinc-700"
                                                                        >
                                                                            {item.image ? (
                                                                                <img
                                                                                    src={item.image}
                                                                                    alt=""
                                                                                    className="h-10 w-10 rounded border border-zinc-200 object-cover"
                                                                                />
                                                                            ) : null}
                                                                            <div>
                                                                                <p className="font-medium">{item.name}</p>
                                                                                <p className="text-zinc-500">
                                                                                    Qty {item.quantity}
                                                                                    {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                                                                                    {item.selectedSize ? ` · ${item.selectedSize}` : ''}
                                                                                    {item.priceValue != null
                                                                                        ? ` · $${Number(item.priceValue).toFixed(2)}`
                                                                                        : ''}
                                                                                </p>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 text-xs text-zinc-600">
                                                            <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                                                                Address &amp; Totals
                                                            </h3>
                                                            <p>
                                                                {[attempt.address_line_1, attempt.address_line_2]
                                                                    .filter(Boolean)
                                                                    .join(', ') || '-'}
                                                            </p>
                                                            <p>
                                                                {[attempt.city, attempt.state, attempt.postal_code, attempt.country]
                                                                    .filter(Boolean)
                                                                    .join(', ') || '-'}
                                                            </p>
                                                            {attempt.notes ? <p>Notes: {attempt.notes}</p> : null}
                                                            <p className="pt-2">
                                                                Subtotal ${Number(attempt.subtotal || 0).toFixed(2)} · Shipping $
                                                                {Number(attempt.shipping || 0).toFixed(2)} · Tax $
                                                                {Number(attempt.tax || 0).toFixed(2)}
                                                            </p>
                                                            <p className="font-mono text-[11px] text-zinc-400">
                                                                Session: {attempt.session_id}
                                                            </p>
                                                            <p className="font-mono text-[11px] text-zinc-400">
                                                                IP: {attempt.ip_address || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
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
        </div>
    );
}