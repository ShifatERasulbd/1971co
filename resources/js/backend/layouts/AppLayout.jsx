import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';

export default function AppLayout() {
    const { pageTitle, user, setUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        async function loadUser() {
            try {
                const response = await fetch('/api/user', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok || ignore) {
                    if (!ignore && response.status === 401) {
                        navigate('/admin');
                    }
                    return;
                }

                const payload = await response.json();
                if (!ignore) {
                    setUser(payload);
                }
            } catch {
                // Keep layout resilient even if user fetch fails.
            }
        }

        if (!user) {
            loadUser();
        }

        return () => {
            ignore = true;
        };
    }, [navigate, setUser, user]);

    useEffect(() => {
        if (!user || user.user_type !== 'customer') {
            return;
        }

        const isDashboardPath = location.pathname === '/admin/dashboard';
        const isOrdersPath = location.pathname === '/admin/orders';

        if (!isDashboardPath && !isOrdersPath) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [location.pathname, navigate, user]);

    const warehouseName = user?.warehouse?.name || 'No Warehouse Assigned';
    const isHomePageBuilder = location.pathname.startsWith('/admin/website/home-page');
    const isAboutPageBuilder = location.pathname.startsWith('/admin/website/about-page');
    const isCommunityPageBuilder = location.pathname.startsWith('/admin/website/community-page');
    const isCustomer = user?.user_type === 'customer';
    const isCustomerAllowedPath = location.pathname === '/admin/dashboard' || location.pathname === '/admin/orders';

    const renderBuilderShell = () => (
        <div className="min-h-screen bg-background">
            <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>
                    <h1 className="text-sm font-semibold md:text-base">{pageTitle}</h1>
                </div>

                <div className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm">
                    {warehouseName}
                </div>
            </header>

            <div className="p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-background px-6 py-10 text-sm text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    if (isCustomer && !isCustomerAllowedPath) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (isHomePageBuilder || isAboutPageBuilder || isCommunityPageBuilder) {
        return renderBuilderShell();
    }

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="md:hidden" />
                        <h1 className="text-sm font-semibold md:text-base">{pageTitle}</h1>
                    </div>

                    <div className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm">
                        {warehouseName}
                    </div>
                </header>

                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
