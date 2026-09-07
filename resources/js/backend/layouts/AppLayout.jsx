import { ArrowLeft, Gauge, ShoppingBag, UserCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import CartDrawer from '../../frontend/components/CartDrawer';
import Footer from '../../frontend/components/Footer';
import Header from '../../frontend/components/Header';
import { CartProvider } from '../../frontend/context/CartContext';

export default function AppLayout() {
    const { pageTitle, user, setUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();
    const isCustomerRoute = location.pathname.startsWith('/user/');

    const isCustomer = user?.user_type === 'customer';
    const dashboardPath = isCustomer ? '/user/dashboard' : '/admin/dashboard';
    const warehouseName = user?.warehouse?.name;
    const isHomePageBuilder = location.pathname.startsWith('/admin/website/home-page');
    const isAboutPageBuilder = location.pathname.startsWith('/admin/website/about-page');
    const isCommunityPageBuilder = location.pathname.startsWith('/admin/website/community-page');
    const isCustomerAllowedPath =
        location.pathname === '/user/dashboard'
        || location.pathname === '/user/orders'
        || location.pathname === '/user/edit-profile';

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
                        setUser(null);
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
        if (!user) {
            return;
        }

        if (user.user_type !== 'customer' && location.pathname.startsWith('/user/')) {
            navigate('/admin/dashboard', { replace: true });
            return;
        }

        if (user.user_type !== 'customer') {
            return;
        }

        const isDashboardPath = location.pathname === '/user/dashboard';
        const isOrdersPath = location.pathname === '/user/orders';
        const isEditProfilePath = location.pathname === '/user/edit-profile';

        if (location.pathname === '/admin/dashboard') {
            navigate('/user/dashboard', { replace: true });
            return;
        }

        if (location.pathname === '/admin/orders') {
            navigate('/user/orders', { replace: true });
            return;
        }

        if (!isDashboardPath && !isOrdersPath && !isEditProfilePath) {
            navigate('/user/dashboard', { replace: true });
        }
    }, [location.pathname, navigate, user]);

    const renderHeaderRight = () => {
        return (
            <div className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm">
                {warehouseName || 'Admin'}
            </div>
        );
    };

    const renderBuilderShell = () => (
        <div className="min-h-screen bg-background">
            <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate(dashboardPath)}>
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>
                    <h1 className="text-sm font-semibold md:text-base">{pageTitle}</h1>
                </div>

                {renderHeaderRight()}
            </header>

            <div className="p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );

    if (!user) {
        if (isCustomerRoute) {
            return (
                <CartProvider>
                    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
                        <Header />
                        <main className="mx-auto flex w-full max-w-[1700px] flex-1 px-6 py-6 sm:px-10 lg:px-16">
                            <div className="grid w-full gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                                <aside className="h-fit rounded border border-zinc-200 bg-white p-3">
                                    <div className="space-y-2">
                                        <div className="h-9 animate-pulse rounded bg-zinc-100" />
                                        <div className="h-9 animate-pulse rounded bg-zinc-100" />
                                        <div className="h-9 animate-pulse rounded bg-zinc-100" />
                                    </div>
                                </aside>
                                <div className="rounded border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
                                    Loading dashboard...
                                </div>
                            </div>
                        </main>
                        <Footer />
                        <CartDrawer />
                    </div>
                </CartProvider>
            );
        }

        return (
            <div className="min-h-screen bg-background px-6 py-10 text-sm text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    if (isCustomer && !isCustomerAllowedPath) {
        return <Navigate to="/user/dashboard" replace />;
    }

    if (isCustomer) {
        return (
            <CartProvider>
                <div className="flex min-h-screen flex-col bg-white text-zinc-950">
                    <Header />

                    <main className="mx-auto flex w-full max-w-[1700px] flex-1 px-6 py-6 sm:px-10 lg:px-16">
                        <div className="grid w-full gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <aside className="h-fit rounded border border-zinc-200 bg-white">
                                <nav aria-label="Customer dashboard" className="p-2">
                                    <NavLink
                                        to="/user/dashboard"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'text-zinc-700 hover:bg-zinc-100'
                                            }`
                                        }
                                    >
                                        <Gauge className="size-4" />
                                        Dashboard
                                    </NavLink>

                                    <NavLink
                                        to="/user/edit-profile"
                                        className={({ isActive }) =>
                                            `mt-1 flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'text-zinc-700 hover:bg-zinc-100'
                                            }`
                                        }
                                    >
                                        <UserCircle2 className="size-4" />
                                        Edit Profile
                                    </NavLink>

                                    <NavLink
                                        to="/user/orders"
                                        className={({ isActive }) =>
                                            `mt-1 flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'text-zinc-700 hover:bg-zinc-100'
                                            }`
                                        }
                                    >
                                        <ShoppingBag className="size-4" />
                                        Orders
                                    </NavLink>
                                </nav>
                            </aside>

                            <div className="min-w-0">
                                <Outlet />
                            </div>
                        </div>
                    </main>

                    <Footer />
                    <CartDrawer />
                </div>
            </CartProvider>
        );
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

                    {renderHeaderRight()}
                </header>

                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
