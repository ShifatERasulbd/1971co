import { useEffect } from 'react';

import { HeaderCard } from '@/components/dashboard/Header-Card';
import { StockOverviewChart } from '@/components/dashboard/chart';
import { LowStockAlertTable } from '@/components/dashboard/low-stock-alertTable';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
    const { setPageTitle } = useAppContext();

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

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