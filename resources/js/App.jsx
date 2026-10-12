import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

import CartDrawer from './frontend/components/CartDrawer.jsx';

import Header from './frontend/components/Header.jsx';
import Footer from './frontend/components/Footer.jsx';
import PageSkeleton from './frontend/components/PageSkeleton.jsx';
import { CartProvider } from './frontend/context/CartContext.jsx';
import useDisableZoom from './frontend/hooks/useDisableZoom.js';
import { preventInvalidBodyAriaHidden } from './utils/preventInvalidBodyAriaHidden.js';
import { bootstrapPublicSettings, getSettingsPayload, onSettingsUpdated } from './utils/siteSettings.js';

// ==========================================
// CHANGE 1: Imported consent & control functions
// ==========================================
import { initializeGoogleAnalytics, trackPageView, enableGoogleAnalytics, disableGoogleAnalytics } from './utils/googleAnalytics.js';
import { initializeFacebookPixel, trackPixelPageView, grantFacebookPixel, revokeFacebookPixel } from './utils/facebookPixel.js';
import { initializeMicrosoftClarity, grantMicrosoftClarity, revokeMicrosoftClarity } from './utils/microsoftClarity.js';
import { getConsent, onConsentChange, deleteCookies } from './utils/consent.js';

preventInvalidBodyAriaHidden();

const HomePage = lazy(() => import('./frontend/pages/HomePage.jsx'));
const ShopPage = lazy(() => import('./frontend/pages/ShopPage.jsx'));
const SingleProductPage = lazy(() => import('./frontend/pages/SingleProduct.jsx'));
const AboutPage = lazy(() => import('./frontend/pages/About.jsx'));
const ContactPage = lazy(() => import('./frontend/pages/Contact.jsx'));
const AuthPage = lazy(() => import('./frontend/pages/Auth.jsx'));
const ResetPasswordPage = lazy(() => import('./frontend/pages/ResetPassword.jsx'));
const CheckoutPage = lazy(() => import('./frontend/pages/Checkout.jsx'));
const OrderConfirmationPage = lazy(() => import('./frontend/pages/OrderConfirmation.jsx'));
const TogetherWeGrowPage = lazy(() => import('./frontend/pages/TogetherWeGrow.jsx'));
const CompliancePolicyPage = lazy(() => import('./frontend/pages/CompliancePolicyPage.jsx'));

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
    const path = String(pathname || '/').toLowerCase().replace(/(.)\/+$/, '$1');

    if (path === '/') return 'Home';
    if (path === '/home') return 'Home';
    if (path === '/shop') return 'Shop';
    if (path === '/about') return 'About';
    if (path === '/contact') return 'Contact';
    if (path === '/together-we-grow') return 'Together We Grow';
    if (path === '/checkout') return 'Checkout';
    if (path === '/order-confirmation') return 'Order Confirmation';
    if (path === '/shipping') return 'Shipping';
    if (path === '/returnandrefund') return 'Return & Refund Policy';
    if (path === '/privacy') return 'Privacy Policy';
    if (path === '/terms') return 'Terms & Conditions';
    if (path === '/login') return 'Login';
    if (path === '/register') return 'Register';
    if (path.startsWith('/reset-password')) return 'Reset Password';
    if (path.startsWith('/search/')) return 'Search';
    if (path.startsWith('/collection/')) return 'Collection';
    if (path === '/new-arrivals') return 'Collection';
    if (path === '/trending') return 'Trending';
    if (path === '/best-sellers') return 'Best Sellers';
    if (path.startsWith('/product-details/')) return 'Product Details';
    if (path === '/singleproduct') return 'Product Details';
    if (path.split('/').filter(Boolean).length <= 2) return 'Shop';

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

        const favicon = normalizeAssetPath(settings?.favicon || settings?.header_logo || '');
        if (favicon) {
            const faviconLink = ensureFaviconLink();
            faviconLink.href = favicon;
        }

        // ==========================================
        // CHANGE 2: Respect consent for page views
        // ==========================================
        const consent = getConsent();
        if (consent.targeting) {
            trackPageView(pathname);
        }
        if (consent.social) {
            trackPixelPageView();
        }
    }, [pathname, settings]);

    // ==========================================
    // CHANGE 3: Consent Initialization & Real-time Listener (`applyCurrentConsent`)
    // ==========================================
    useEffect(() => {
        const gaId = settings?.google_analytics_id || settings?.ga_measurement_id || '';
        const clarityId = settings?.microsoft_clarity_id || '';

        // Apply initial state based on consent (Defaults to true/ON if not set)
        const applyCurrentConsent = () => {
            const consent = getConsent();

            // 1. Targeting -> Google Analytics
            if (gaId) {
                if (!window.__gaInitialized) {
                    initializeGoogleAnalytics(gaId);
                    window.__gaInitialized = true;
                }
                if (consent.targeting) {
                    enableGoogleAnalytics();
                } else {
                    disableGoogleAnalytics();
                    deleteCookies({
                        names: ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw', '_gcl_dc', 'FPID'],
                        prefixes: ['_ga_', '_gac_', '_gat_', '_dc_gtm_'],
                    });
                }
            }

            // 2. Performance -> Microsoft Clarity
            if (clarityId) {
                if (!window.__clarityInitialized) {
                    initializeMicrosoftClarity(clarityId);
                    window.__clarityInitialized = true;
                }
                if (consent.performance) {
                    grantMicrosoftClarity();
                } else {
                    revokeMicrosoftClarity();
                    deleteCookies({ names: ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'SM'] });
                }
            }

            // 3. Social -> Meta Pixel
            const pixelId = window.__fbPixelId;
            if (pixelId) {
                if (!window.__fbPixelInitialized) {
                    initializeFacebookPixel(pixelId);
                    window.__fbPixelInitialized = true;
                }
                if (consent.social) {
                    grantFacebookPixel();
                } else {
                    revokeFacebookPixel();
                    deleteCookies({ names: ['_fbp', '_fbc'] });
                }
            }
        };

        applyCurrentConsent();

        // Listen for changes when user updates preferences in the footer modal
        const unsubscribeConsent = onConsentChange(() => {
            applyCurrentConsent();
        });

        return () => {
            unsubscribeConsent();
        };
    }, [settings]);

    // ==========================================
    // CHANGE 4: Tied Meta Pixel Dynamic Config Fetch to Consent State
    // ==========================================
    useEffect(() => {
        let isCancelled = false;

        fetch('/api/public/facebook-pixel-config')
            .then((response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (isCancelled || !payload?.pixelId) {
                    return;
                }

                window.__fbPixelId = payload.pixelId;
                const consent = getConsent();
                initializeFacebookPixel(payload.pixelId);
                window.__fbPixelInitialized = true;

                if (consent.social) {
                    grantFacebookPixel();
                    trackPixelPageView();
                } else {
                    revokeFacebookPixel();
                }
            })
            .catch(() => {});

        return () => {
            isCancelled = true;
        };
    }, []);

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
        <div className="flex min-h-screen flex-col bg-white text-zinc-950">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <Toaster position="top-right" richColors />
        </div>
    );
}

function AppRouter() {
    useDisableZoom();

    useEffect(() => {
        bootstrapPublicSettings();
    }, []);

    return (
        <CartProvider>
            <BrowserRouter>
                <DocumentBrandingManager />
                <Routes>
                    <Route element={<FrontendLayout />}>
                        <Route index element={withPageFallback(HomePage)} />
                        <Route path="home" element={<Navigate to="/" replace />} />
                        <Route path="shop" element={withPageFallback(ShopPage)} />
                        <Route path="search/:productSlug" element={withPageFallback(ShopPage)} />
                        <Route path="collection/:slug" element={withPageFallback(ShopPage)} />
                        <Route path="new-arrivals" element={withPageFallback(ShopPage)} />
                        <Route path="trending" element={withPageFallback(ShopPage)} />
                        <Route path="best-sellers" element={withPageFallback(ShopPage)} />
                        <Route path=":subCategorySlug/:grandChildSlug?" element={withPageFallback(ShopPage)} />
                        <Route path="product-details/:slug/:color?" element={withPageFallback(SingleProductPage)} />
                        <Route path="singleProduct" element={withPageFallback(SingleProductPage)} />
                        <Route path="about" element={withPageFallback(AboutPage)} />
                        <Route path="contact" element={withPageFallback(ContactPage)} />
                        <Route path="together-we-grow" element={withPageFallback(TogetherWeGrowPage)} />
                        <Route path="checkout" element={withPageFallback(CheckoutPage)} />
                        <Route path="order-confirmation" element={withPageFallback(OrderConfirmationPage)} />
                        <Route path="shipping" element={withPageFallback(CompliancePolicyPage)} />
                        <Route path="returnandrefund" element={withPageFallback(CompliancePolicyPage)} />
                        <Route path="privacy" element={withPageFallback(CompliancePolicyPage)} />
                        <Route path="terms" element={withPageFallback(CompliancePolicyPage)} />
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