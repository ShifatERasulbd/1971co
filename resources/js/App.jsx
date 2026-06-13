import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Header from './frontend/components/Header.jsx';
import Footer from './frontend/components/Footer.jsx';
import PageSkeleton from './frontend/components/PageSkeleton.jsx';

const HomePage = lazy(() => import('./frontend/pages/HomePage.jsx'));
const ShopPage = lazy(() => import('./frontend/pages/ShopPage.jsx'));
const SingleProductPage = lazy(() => import('./frontend/pages/singleProduct.jsx'));
const AboutPage = lazy(() => import('./frontend/pages/about.jsx'));
const ContactPage = lazy(() => import('./frontend/pages/contact.jsx'));
const AuthPage = lazy(() => import('./frontend/pages/Auth.jsx'));

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
        </div>
    );
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<FrontendLayout />}>
                    <Route index element={withPageFallback(HomePage)} />
                    <Route path="shop" element={withPageFallback(ShopPage)} />
                    <Route path="singleProduct" element={withPageFallback(SingleProductPage)} />
                    <Route path="about" element={withPageFallback(AboutPage)} />
                    <Route path="contact" element={withPageFallback(ContactPage)} />
                    <Route path="login" element={withPageFallback(AuthPage)} />
                    <Route path="register" element={withPageFallback(AuthPage)} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
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