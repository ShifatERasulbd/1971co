import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

import CartDrawer from './frontend/components/CartDrawer.jsx';
import Header from './frontend/components/Header.jsx';
import Footer from './frontend/components/Footer.jsx';
import PageSkeleton from './frontend/components/PageSkeleton.jsx';
import { CartProvider } from './frontend/context/CartContext.jsx';
import { bootstrapPublicSettings, getSettingsPayload, onSettingsUpdated } from './utils/siteSettings';
import { initializeGoogleAnalytics, trackPageView } from './utils/googleAnalytics';

const HomePage = lazy(() => import('./frontend/pages/HomePage.jsx'));
const ShopPage = lazy(() => import('./frontend/pages/ShopPage.jsx'));
const SingleProductPage = lazy(() => import('./frontend/pages/singleProduct.jsx'));
const AboutPage = lazy(() => import('./frontend/pages/about.jsx'));
const ContactPage = lazy(() => import('./frontend/pages/contact.jsx'));
const AuthPage = lazy(() => import('./frontend/pages/Auth.jsx'));
const ResetPasswordPage = lazy(() => import('./frontend/pages/ResetPassword.jsx'));
const CheckoutPage = lazy(() => import('./frontend/pages/Checkout.jsx'));
const OrderConfirmationPage = lazy(() => import('./frontend/pages/OrderConfirmation.jsx'));
const TogetherWeGrowPage = lazy(() => import('./frontend/pages/TogetherWeGrow.jsx'));

const BRAND_NAME = '1971Co';

function normalizeAssetPath(value) {
    if (typeof value !== 'string') {
        return '';
    }

    const raw = value.trim();
    if (!raw) {
        return '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        return raw;
    }

    return `/${raw.replace(/^\/+/, '')}`;
}

function resolvePageLabel(pathname) {
    const path = String(pathname || '/').toLowerCase();

    if (path === '/') return 'Home';
    if (path === '/shop') return 'Shop';
    if (path.startsWith('/search/')) return 'Search';
    if (path.startsWith('/collection/')) return 'Collection';
    if (path === '/new-arrivals') return 'Collection';
    if (path === '/best-sellers') return 'Best Sellers';
    if (path.startsWith('/product-details/')) return 'Product Details';
    if (path === '/singleproduct') return 'Product Details';
    if (path.split('/').filter(Boolean).length <= 2) return 'Shop';
    if (path === '/about') return 'About';
    if (path === '/contact') return 'Contact';
    if (path === '/together-we-grow') return 'Together We Grow';
    if (path === '/checkout') return 'Checkout';
    if (path === '/order-confirmation') return 'Order Confirmation';
    if (path === '/login') return 'Login';
    if (path === '/register') return 'Register';
    if (path.startsWith('/reset-password')) return 'Reset Password';

    return 'Home';
}

function ensureFaviconLink() {
    const existing = document.getElementById('app-favicon');
    if (existing) {
        return existing;
    }

    const link = document.createElement('link');
    link.id = 'app-favicon';
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
    return link;
}

function DocumentBrandingManager() {
    const { pathname } = useLocation();
    const [settings, setSettings] = React.useState(() => getSettingsPayload() || {});

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSettings(payload || {});
        });

        setSettings(getSettingsPayload() || {});
        return unsubscribe;
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const pageLabel = resolvePageLabel(pathname);
        document.title = `${pageLabel} | ${BRAND_NAME}`;

        const favicon = normalizeAssetPath(settings?.header_logo || '');
        if (favicon) {
            const faviconLink = ensureFaviconLink();
            faviconLink.href = favicon;
        }

        // Track page view with Google Analytics
        trackPageView(pathname);
    }, [pathname, settings]);

    useEffect(() => {
        // Initialize Google Analytics when GA measurement ID is available
        const gaId = settings?.google_analytics_id || settings?.ga_measurement_id || '';
        if (gaId && !window.__gaInitialized) {
            initializeGoogleAnalytics(gaId);
            window.__gaInitialized = true;
        }
    }, [settings]);

    return null;
}

function withPageFallback(Component) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <Component />
        </Suspense>
    );
}

function FrontendLayout() {
    return (
        <div className="min-h-screen bg-white text-zinc-950">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <Toaster position="top-right" richColors />
        </div>
    );
}

function AppRouter() {
    useEffect(() => {
        bootstrapPublicSettings();
    }, []);

    return (
        <CartProvider>
            <BrowserRouter>
                <DocumentBrandingManager />
                <Routes>
                    <Route path="/" element={<FrontendLayout />}>
                        <Route index element={withPageFallback(HomePage)} />
                        <Route path="shop" element={withPageFallback(ShopPage)} />
                        <Route path="search/:productSlug" element={withPageFallback(ShopPage)} />
                        <Route path="collection/:slug" element={withPageFallback(ShopPage)} />
                        <Route path="new-arrivals" element={withPageFallback(ShopPage)} />
                        <Route path="best-sellers" element={withPageFallback(ShopPage)} />
                        <Route path=":subCategorySlug/:grandChildSlug?" element={withPageFallback(ShopPage)} />
                        <Route path="product-details/:slug/:color?" element={withPageFallback(SingleProductPage)} />
                        <Route path="singleProduct" element={withPageFallback(SingleProductPage)} />
                        <Route path="about" element={withPageFallback(AboutPage)} />
                        <Route path="contact" element={withPageFallback(ContactPage)} />
                        <Route path="together-we-grow" element={withPageFallback(TogetherWeGrowPage)} />
                        <Route path="checkout" element={withPageFallback(CheckoutPage)} />
                        <Route path="order-confirmation" element={withPageFallback(OrderConfirmationPage)} />
                        <Route path="login" element={withPageFallback(AuthPage)} />
                        <Route path="register" element={withPageFallback(AuthPage)} />
                        <Route path="reset-password/:token" element={withPageFallback(ResetPasswordPage)} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        React.createElement(
            React.StrictMode,
            null,
            React.createElement(AppRouter)
        )
    );
}