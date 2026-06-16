import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const ShopHeroSection = lazy(() => import('../components/ShopHeroSection.jsx'));
const ShopCatalogSection = lazy(() => import('../components/ShopCatalogSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass, variant = 'generic' }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} variant={variant} />}>{children}</Suspense>;
}

export default function ShopPage() {
    return (
        <div className="bg-white">
           
            <LazySection heightClass="h-[760px]" variant="catalog">
                <ShopCatalogSection />
            </LazySection>
            
           
        </div>
    );
}
