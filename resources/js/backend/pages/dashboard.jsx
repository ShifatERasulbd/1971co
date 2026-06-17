import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { HeaderCard } from '@/components/dashboard/Header-Card';
import { StockOverviewChart } from '@/components/dashboard/chart';
import { LowStockAlertTable } from '@/components/dashboard/low-stock-alertTable';
import { useAppContext } from '@/context/AppContext';
import { requestJson } from '@/lib/apiClient';

export default function Dashboard() {
    const { setPageTitle, user } = useAppContext();
    const [headerCards, setHeaderCards] = useState([]);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    useEffect(() => {
        if (!user || user?.user_type === 'customer') {
            return;
        }

        let ignore = false;

        async function loadSummary() {
            setIsSummaryLoading(true);

            try {
                const payload = await requestJson('/api/orders?per_page=1000');
                const orders = Array.isArray(payload?.data) ? payload.data : [];

                const totalPurchase = orders.reduce((sum, order) => sum + Number(order?.subtotal || 0), 0);
                const totalSell = orders.reduce((sum, order) => sum + Number(order?.items_count || 0), 0);
                const totalRevenue = orders.reduce((sum, order) => sum + Number(order?.total || 0), 0);

                if (!ignore) {
                    setHeaderCards([
                        {
                            title: 'Total Purchase',
                            amount: totalPurchase,
                            format: 'currency',
                            description: 'From all checkout orders',
                        },
                        {
                            title: 'Total Sell',
                            amount: totalSell,
                            format: 'count',
                            description: 'Items sold across all orders',
                        },
                        {
                            title: 'Total Revenue',
                            amount: totalRevenue,
                            format: 'currency',
                            description: 'Gross revenue from checkout totals',
                        },
                    ]);
                }
            } catch {
                if (!ignore) {
                    setHeaderCards([
                        { title: 'Total Purchase', amount: 0, format: 'currency', description: 'From all checkout orders' },
                        { title: 'Total Sell', amount: 0, format: 'count', description: 'Items sold across all orders' },
                        { title: 'Total Revenue', amount: 0, format: 'currency', description: 'Gross revenue from checkout totals' },
                    ]);
                }
            } finally {
                if (!ignore) {
                    setIsSummaryLoading(false);
                }
            }
        }

        loadSummary();

        return () => {
            ignore = true;
        };
    }, [user]);

    if (!user) {
        return <div className="text-sm text-zinc-500">Loading dashboard...</div>;
    }

    if (user?.user_type === 'customer') {
        return (
            <div className="space-y-5">
                <div className="rounded border border-zinc-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Customer Dashboard</p>
                    <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Welcome back, {user.first_name || user.name}</h2>
                    <p className="mt-2 max-w-xl text-sm text-zinc-600">
                        You can review your recent orders and track their status from your orders section.
                    </p>
                    <div className="mt-5">
                        <Link
                            to="/admin/orders"
                            className="inline-flex h-10 items-center rounded bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-black"
                        >
                            View My Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <HeaderCard items={headerCards} loading={isSummaryLoading} />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <LowStockAlertTable />
                <StockOverviewChart />
            </div>
        </div>
    );
}