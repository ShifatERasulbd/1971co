import { Layers, RefreshCw, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { timelessFontClass } from '../../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const FALLBACK_FEATURES = [
    {
        id: 1,
        title: 'Premium Materials',
        description: 'Quality fabrics built to last',
        icon_url: null,
        _fallbackIcon: Layers,
    },
    {
        id: 2,
        title: 'Made for Daily Wear',
        description: "Essentials you'll reach for every day",
        icon_url: null,
        _fallbackIcon: RefreshCw,
    },
    {
        id: 3,
        title: 'Clean, Urban Fit',
        description: 'Modern silhouettes, timeless style',
        icon_url: null,
        _fallbackIcon: Tag,
    },
];

function FeatureItem({ feature, isLast }) {
    const FallbackIcon = feature._fallbackIcon;

    return (
        <div className={`group flex items-start gap-5 py-8 sm:py-10 ${!isLast ? 'border-b border-zinc-200 sm:border-b-0 sm:border-r sm:pr-12 lg:pr-16' : ''} ${!isLast || true ? 'sm:px-12 lg:px-16' : ''} first:sm:pl-0`}>
            <div className="mt-0.5 flex size-12 flex-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-all duration-200 group-hover:border-zinc-300 group-hover:text-zinc-700 group-hover:shadow-md">
                {feature.icon_url ? (
                    <img
                        src={feature.icon_url}
                        alt=""
                        aria-hidden="true"
                        className="size-6 object-contain"
                    />
                ) : FallbackIcon ? (
                    <FallbackIcon className="size-5" strokeWidth={1.5} />
                ) : null}
            </div>

            <div className="min-w-0">
                <h3
                    className={`${sectionTypography.title} text-zinc-900`}
                    style={
                        feature.title_font_family
                            ? { fontFamily: feature.title_font_family }
                            : undefined
                    }
                >
                    {feature.title}
                </h3>
                <p
                    className={`${sectionTypography.description} mt-1 text-zinc-500`}
                    style={
                        feature.description_font_family
                            ? { fontFamily: feature.description_font_family }
                            : undefined
                    }
                >
                    {feature.description}
                </p>
            </div>
        </div>
    );
}

export default function FeaturesSection() {
    const [features, setFeatures] = useState(FALLBACK_FEATURES);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const res = await fetch('/api/public/features', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore && Array.isArray(data) && data.length > 0) {
                        setFeatures(data);
                    }
                }
            } catch {
                // keep fallback
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    return (
        <section className={`${timelessFontClass} border-y border-zinc-200 bg-[#f8f8f7]`}>
            <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16">
                <div className="grid grid-cols-1 divide-y divide-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {features.slice(0, 3).map((feature, index) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                            isLast={index === Math.min(features.length, 3) - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
