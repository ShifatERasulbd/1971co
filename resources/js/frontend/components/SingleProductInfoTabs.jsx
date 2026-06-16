import { useState } from 'react';

import { featuresFontClass } from '../utils/typography';

export default function SingleProductInfoTabs({ product }) {
    const tabs = [
        {
            id: 'description',
            label: 'Description',
            content: (
                <div className="space-y-7 text-[1.05rem] leading-9 text-slate-600 sm:text-[1.08rem]">
                    <p>{String(product?.description || 'No product description available.')}</p>
                    {product?.long_description ? (
                        <p>{String(product.long_description)}</p>
                    ) : null}
                </div>
            ),
        },
        {
            id: 'additional',
            label: 'Additional Information',
            content: (
                <div className="space-y-4 text-[1.05rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                    <p>{String(product?.additional_information || 'No additional information available.')}</p>
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
    ];

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
