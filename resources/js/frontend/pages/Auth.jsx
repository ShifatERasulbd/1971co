import { Suspense, lazy, useState } from 'react';
import { useLocation } from 'react-router-dom';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const AuthUserTypeTabs = lazy(() => import('../components/AuthUserTypeTabs.jsx'));
const AuthLoginForm = lazy(() => import('../components/AuthLoginForm.jsx'));
const AuthRegisterForm = lazy(() => import('../components/AuthRegisterForm.jsx'));

const authShowcaseImage = '/uploads/heroes/images/hero1.webp';

export default function AuthPage() {
    const location = useLocation();
    const isRegister = location.pathname.toLowerCase() === '/register';
    const [userType, setUserType] = useState('normal');
    const isCorporate = userType === 'corporate';
    const swapSides = isCorporate;

    return (
        <section className="bg-[#f5f5f3] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="mx-auto grid w-full max-w-[1500px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
                <div
                    className={`mx-auto w-full max-w-[620px] transition-all duration-500 ease-out lg:will-change-transform ${
                        swapSides ? 'lg:order-2 lg:translate-x-8' : 'lg:order-1 lg:translate-x-0'
                    }`}
                >
                    <h1 className="font-serif text-[2.3rem] uppercase tracking-[0.02em] text-zinc-900 sm:text-[2.8rem]">
                        {isRegister ? 'Create Account' : 'Login'}
                    </h1>

                    <Suspense fallback={<SectionSkeleton heightClass="h-[80px]" className="px-0 py-2" />}>
                        <AuthUserTypeTabs userType={userType} onChangeUserType={setUserType} />
                    </Suspense>

                    <Suspense fallback={<SectionSkeleton heightClass="h-[540px]" className="px-0 py-2" />}>
                        {isRegister ? <AuthRegisterForm userType={userType} /> : <AuthLoginForm userType={userType} />}
                    </Suspense>
                </div>

                <div
                    className={`mx-auto w-full max-w-[780px] border-[16px] border-zinc-200 bg-zinc-200 transition-all duration-500 ease-out lg:will-change-transform ${
                        swapSides ? 'lg:order-1 lg:-translate-x-6' : 'lg:order-2 lg:translate-x-0'
                    }`}
                >
                    <img
                        src={authShowcaseImage}
                        alt="Timeless apparel showcase"
                        className="h-[300px] w-full object-cover object-center sm:h-[420px] lg:h-[560px]"
                    />
                </div>
            </div>
        </section>
    );
}
