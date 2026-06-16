import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { HeaderCard } from '@/components/dashboard/Header-Card';
import { StockOverviewChart } from '@/components/dashboard/chart';
import { LowStockAlertTable } from '@/components/dashboard/low-stock-alertTable';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    const { setPageTitle, user } = useAppContext();

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

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
                <HeaderCard />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <LowStockAlertTable />
                <StockOverviewChart />
            </div>
        </div>
    );
}