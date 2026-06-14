import React, { Suspense, lazy } from 'react'
import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function lazyWithRetry(importer, key) {
    return lazy(async () => {
        const storageKey = `lazy-retry:${key}`;

        try {
            const module = await importer();
            sessionStorage.removeItem(storageKey);
            return module;
        } catch (error) {
            const hasRetried = sessionStorage.getItem(storageKey) === '1';

            if (!hasRetried && error instanceof TypeError) {
                sessionStorage.setItem(storageKey, '1');
                window.location.reload();
                return new Promise(() => {});
            }

            sessionStorage.removeItem(storageKey);
            throw error;
        }
    });
}

const Dashboard = lazyWithRetry(() => import('@/pages/dashboard'), 'dashboard');
// Hero Management
const Heroes    = lazyWithRetry(() => import('@/pages/Hero/hero'), 'hero');
const AddHero   = lazyWithRetry(() => import('@/pages/Hero/addHero'), 'add-hero');
const EditHero  = lazyWithRetry(() => import('@/pages/Hero/editHero'), 'edit-hero');

// Personalization Management
const PersonalizerFeatures = lazyWithRetry(() => import('../personalizer/features'), 'personalizer-features');
const PersonalizerConfirmOrder = lazyWithRetry(() => import('../personalizer/confirm-order'), 'personalizer-confirm-order');
const PersonalizerMockupPreview = lazyWithRetry(() => import('../personalizer/mockup-preview'), 'personalizer-mockup-preview');
const PersonalizationOrders = lazyWithRetry(() => import('@/pages/Personalization/orders'), 'personalization-orders');
const ViewPersonalizationOrder = lazyWithRetry(() => import('@/pages/Personalization/viewOrder'), 'personalization-order-view');
const EditPersonalizationOrder = lazyWithRetry(() => import('@/pages/Personalization/editOrder'), 'personalization-order-edit');

// Features Management
const Features = lazyWithRetry(()=> import ('@/pages/Features/features'), 'features');
const AddFeature = lazyWithRetry(() => import('@/pages/Features/addFeature'), 'add-feature');
const EditFeature = lazyWithRetry(() => import('@/pages/Features/editFeature'), 'edit-feature');

// Website Management
const HomePageBuilder = lazyWithRetry(() => import('@/pages/Website/homePageBuilder'), 'website-home-page-builder');

// Category Management
const Categories = lazyWithRetry(() => import('@/pages/Category/category'), 'categories');
const AddCategory = lazyWithRetry(() => import('@/pages/Category/addCategory'), 'add-category');
const EditCategory = lazyWithRetry(() => import('@/pages/Category/editCategory'), 'edit-category');

// SubCategory Management
const SubCategories = lazyWithRetry(() => import('@/pages/SubCategory/subcategory'), 'sub-categories');
const AddSubCategory = lazyWithRetry(() => import('@/pages/SubCategory/addSubCategory'), 'add-sub-category');
const EditSubCategory = lazyWithRetry(() => import('@/pages/SubCategory/editSubCategory'), 'edit-sub-category');

// GrandChild Management
const GrandChilds = lazyWithRetry(() => import('@/pages/GrandChild/grandchild'), 'grand-childs');
const AddGrandChild = lazyWithRetry(() => import('@/pages/GrandChild/addGrandChild'), 'add-grand-child');
const EditGrandChild = lazyWithRetry(() => import('@/pages/GrandChild/editGrandChild'), 'edit-grand-child');



// Product Management
const Products = lazyWithRetry(() => import('@/pages/Product/products'), 'products');
const AddProduct = lazyWithRetry(() => import('@/pages/Product/addProduct'), 'add-product');
const EditProduct = lazyWithRetry(() => import('@/pages/Product/editProduct'), 'edit-product');



export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                                    <LoginForm />
                                </main>
                            }
                        />
                        {/* user Managemnent */}
                        <Route path="/admin" element={<AppLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            {/* Hero  */}
                            <Route path="hero" element={<Heroes />} />
                            <Route path="hero/add" element={<AddHero />} />
                            <Route path="hero/:id/edit" element={<EditHero />} />

                            {/* Personalization Orders */}
                            <Route path="personalization/orders" element={<PersonalizationOrders />} />
                            <Route path="personalization/orders/:id" element={<ViewPersonalizationOrder />} />
                            <Route path="personalization/orders/:id/edit" element={<EditPersonalizationOrder />} />

                            {/* Features Management */}
                            <Route path="features" element={<Features />} />
                            <Route path="features/add" element={<AddFeature />} />
                            <Route path="features/:id/edit" element={<EditFeature />} />

                            {/* Website Management */}
                            <Route path="website/home-page" element={<HomePageBuilder />} />

                            {/* Category Management */}
                            <Route path="category" element={<Categories />} />
                            <Route path="category/add" element={<AddCategory />} />
                            <Route path="category/:id/edit" element={<EditCategory />} />

                            {/* SubCategory Management */}
                            <Route path="sub-category" element={<SubCategories />} />
                            <Route path="sub-category/add" element={<AddSubCategory />} />
                            <Route path="sub-category/:id/edit" element={<EditSubCategory />} />

                            {/* GrandChild Management */}
                            <Route path="grand-child" element={<GrandChilds />} />
                            <Route path="grand-child/add" element={<AddGrandChild />} />
                            <Route path="grand-child/:id/edit" element={<EditGrandChild />} />


                            {/* Product Management */}
                            <Route path="products" element={<Products />} />
                            <Route path="products/add" element={<AddProduct />} />
                            <Route path="products/:id/edit" element={<EditProduct />} />

                           

                        </Route>

                        <Route path="/personalizer/features" element={<PersonalizerFeatures />} />
                        <Route path="/personalizer/confirm-order" element={<PersonalizerConfirmOrder />} />
                        <Route path="/personalizer/mockup-preview" element={<PersonalizerMockupPreview />} />
                        <Route path="/" element={<main />} />

                        {/* Hero Management */}
                       
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}