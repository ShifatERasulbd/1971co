import { useState } from 'react';

import { featuresFontClass } from '../../utils/typography';

const tabs = [
    {
        id: 'description',
        label: 'Description',
        content: (
            <div className="space-y-7 text-[1.05rem] leading-9 text-slate-600 sm:text-[1.08rem]">
                <p>
                    A modern essential designed for professional everyday wear. The Corporate Full Sleeve
                    T-shirt combines premium-quality fabric, a comfortable fit, and a clean minimal
                    design, perfect for teams, branding, and corporate environments.
                </p>

                <div>
                    <h3 className="text-[2.2rem] font-medium leading-none text-zinc-900">Fabric Care</h3>
                    <ul className="mt-4 list-disc space-y-1.5 pl-7">
                        <li>Bio-washed premium cotton fabric</li>
                        <li>Do not bleach</li>
                        <li>Iron inside out on low heat</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-[2.2rem] font-medium leading-none text-zinc-900">Fit &amp; Mesurement</h3>
                    <ul className="mt-4 list-disc space-y-1.5 pl-7">
                        <li>Regular fit for everyday comfort</li>
                        <li>Full sleeve design with a modern silhouette</li>
                        <li>Product color may slightly vary due to lighting or screen settings.</li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: 'additional',
        label: 'Additional Information',
        content: (
            <div className="space-y-4 text-[1.05rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                <p>Material: 100% Premium Cotton</p>
                <p>Style: Corporate Full Sleeve</p>
                <p>Neck: Crew Neck</p>
                <p>Fit: Regular Fit</p>
                <p>Origin: Designed and finished in Canada</p>
            </div>
        ),
    },
    {
        id: 'shipping',
        label: 'Shipping & Returns',
        content: (
            <div className="space-y-4 text-[1.05rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                <p>Shipping usually takes 3-7 business days depending on your location.</p>
                <p>Bulk and customized orders may require additional preparation time.</p>
                <p>Returns accepted within 14 days for non-customized products in original condition.</p>
            </div>
        ),
    },
    {
        id: 'reviews',
        label: 'Reviews (0)',
        content: (
            <p className="text-[1.05rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                There are no reviews yet. Be the first to review this product.
            </p>
        ),
    },
];

export default function SingleProductInfoTabs() {
    const [activeTab, setActiveTab] = useState('description');

    const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

    return (
        <section className={`${featuresFontClass} bg-white px-5 pb-14 pt-4 sm:px-8 lg:px-12 lg:pb-20`}>
            <div className="mx-auto w-full max-w-[1480px]">
                <div className="flex flex-wrap gap-x-9 gap-y-3 border-b border-zinc-200 pb-2">
                    {tabs.map((tab) => {
                        const isActive = tab.id === currentTab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-3 text-[0.98rem] font-medium uppercase tracking-[0.04em] transition-colors sm:text-[1.05rem] ${
                                    isActive
                                        ? 'text-zinc-900 after:absolute after:bottom-[-9px] after:left-0 after:h-[2px] after:w-full after:bg-zinc-900'
                                        : 'text-slate-500 hover:text-zinc-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="pt-8">{currentTab.content}</div>
            </div>
        </section>
    );
}
