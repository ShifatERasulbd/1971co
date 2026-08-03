import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';

export default function AppLayout() {
    const { pageTitle, user, setUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const isCustomer = user?.user_type === 'customer';
    const dashboardPath = isCustomer ? '/user/dashboard' : '/admin/dashboard';
    const warehouseName = user?.warehouse?.name;
    const isHomePageBuilder = location.pathname.startsWith('/admin/website/home-page');
    const isAboutPageBuilder = location.pathname.startsWith('/admin/website/about-page');
    const isCommunityPageBuilder = location.pathname.startsWith('/admin/website/community-page');
    const isCustomerAllowedPath = location.pathname === '/user/dashboard' || location.pathname === '/user/orders';

    const customerDisplayName = useMemo(() => {
        const fullName = String(user?.name || '').trim();
        if (fullName) {
            return fullName;
        }

        const fallbackName = [user?.first_name, user?.last_name]
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .join(' ');

        return fallbackName || 'Customer';
    }, [user?.first_name, user?.last_name, user?.name]);

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
        if (!user) {
            return;
        }

        setProfileForm({
            first_name: String(user.first_name || '').trim(),
            last_name: String(user.last_name || '').trim(),
            email: String(user.email || '').trim(),
            password: '',
            password_confirmation: '',
        });
    }, [user]);

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

        if (location.pathname === '/admin/dashboard') {
            navigate('/user/dashboard', { replace: true });
            return;
        }

        if (location.pathname === '/admin/orders') {
            navigate('/user/orders', { replace: true });
            return;
        }

        if (!isDashboardPath && !isOrdersPath) {
            navigate('/user/dashboard', { replace: true });
        }
    }, [location.pathname, navigate, user]);

    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
        setProfileError('');
        setProfileSuccess('');
        setProfileForm((previous) => ({
            ...previous,
            password: '',
            password_confirmation: '',
        }));
    };

    const handleProfileFieldChange = (field, value) => {
        setProfileForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleCustomerLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setIsLoggingOut(false);
            navigate('/admin');
        }
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        if (isProfileSubmitting) {
            return;
        }

        setProfileError('');
        setProfileSuccess('');
        setIsProfileSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const payload = {
                first_name: String(profileForm.first_name || '').trim(),
                last_name: String(profileForm.last_name || '').trim(),
                email: String(profileForm.email || '').trim(),
                password: String(profileForm.password || ''),
                password_confirmation: String(profileForm.password_confirmation || ''),
            };

            if (!payload.password) {
                delete payload.password;
                delete payload.password_confirmation;
            }

            const response = await fetch('/api/customer/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const firstValidationError = data?.errors
                    ? Object.values(data.errors)[0]?.[0]
                    : null;
                setProfileError(firstValidationError || data?.message || 'Unable to update profile.');
                return;
            }

            if (data?.user) {
                setUser(data.user);
            }

            setProfileForm((previous) => ({
                ...previous,
                password: '',
                password_confirmation: '',
            }));
            setProfileSuccess(data?.message || 'Profile updated successfully.');
        } catch {
            setProfileError('Unable to update profile right now. Please try again.');
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    const renderHeaderRight = () => {
        if (!isCustomer) {
            return (
                <div className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm">
                    {warehouseName || 'Admin'}
                </div>
            );
        }

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((previous) => !previous)}
                    className="inline-flex items-center rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted md:text-sm"
                >
                    {customerDisplayName}
                </button>

                {isUserMenuOpen ? (
                    <div className="absolute right-0 z-30 mt-2 min-w-[170px] rounded-md border border-border bg-white p-1 shadow-lg">
                        <button
                            type="button"
                            onClick={() => {
                                setIsUserMenuOpen(false);
                                setIsProfileModalOpen(true);
                            }}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                            Profile
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsUserMenuOpen(false);
                                handleCustomerLogout();
                            }}
                            disabled={isLoggingOut}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:opacity-60"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                ) : null}
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
        return (
            <div className="min-h-screen bg-background px-6 py-10 text-sm text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    if (isCustomer && !isCustomerAllowedPath) {
        return <Navigate to="/user/dashboard" replace />;
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

            {isCustomer && isProfileModalOpen ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold">Update Profile</h2>
                            <button
                                type="button"
                                onClick={closeProfileModal}
                                className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Close
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={handleProfileSubmit}>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">First Name</label>
                                <input
                                    type="text"
                                    value={profileForm.first_name}
                                    onChange={(event) => handleProfileFieldChange('first_name', event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Last Name</label>
                                <input
                                    type="text"
                                    value={profileForm.last_name}
                                    onChange={(event) => handleProfileFieldChange('last_name', event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Email</label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(event) => handleProfileFieldChange('email', event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">New Password (optional)</label>
                                <input
                                    type="password"
                                    value={profileForm.password}
                                    onChange={(event) => handleProfileFieldChange('password', event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={profileForm.password_confirmation}
                                    onChange={(event) => handleProfileFieldChange('password_confirmation', event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                                />
                            </div>

                            {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
                            {profileSuccess ? <p className="text-sm text-emerald-700">{profileSuccess}</p> : null}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeProfileModal}
                                    className="inline-flex h-10 items-center rounded border border-zinc-300 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProfileSubmitting}
                                    className="inline-flex h-10 items-center rounded bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                                >
                                    {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </SidebarProvider>
    );
}
