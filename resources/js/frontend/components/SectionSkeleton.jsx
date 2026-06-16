function SkeletonLine({ className = '' }) {
    return <div className={`h-3 rounded bg-zinc-200 ${className}`.trim()} />;
}

function HeroSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1920px] animate-pulse">
            <div className="relative min-h-[520px] overflow-hidden bg-zinc-200">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),rgba(0,0,0,0.08))]" />
                <div className="relative mx-auto flex min-h-[520px] max-w-[860px] flex-col items-center justify-center gap-5 px-6 text-center">
                    <div className="h-5 w-44 rounded bg-zinc-300" />
                    <div className="h-14 w-[80%] rounded bg-zinc-300" />
                    <div className="h-14 w-[68%] rounded bg-zinc-300" />
                    <div className="h-4 w-[72%] rounded bg-zinc-300" />
                    <div className="h-4 w-[56%] rounded bg-zinc-300" />
                    <div className="mt-4 flex gap-3">
                        <div className="h-11 w-36 rounded bg-zinc-300" />
                        <div className="h-11 w-40 rounded bg-zinc-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SplitSkeleton() {
    return (
        <div className="mx-auto grid w-full max-w-[1700px] animate-pulse gap-8 lg:grid-cols-2">
            <div className="h-[520px] rounded bg-zinc-200" />
            <div className="space-y-4 self-center px-2 sm:px-4">
                <div className="h-5 w-36 rounded bg-zinc-200" />
                <div className="h-11 w-[86%] rounded bg-zinc-200" />
                <div className="h-4 w-[95%] rounded bg-zinc-200" />
                <div className="h-4 w-[90%] rounded bg-zinc-200" />
                <div className="h-4 w-[72%] rounded bg-zinc-200" />
                <div className="pt-4">
                    <div className="h-11 w-36 rounded bg-zinc-200" />
                </div>
            </div>
        </div>
    );
}

function ProductDetailsSkeleton() {
    return (
        <div className="mx-auto grid w-full max-w-[1700px] animate-pulse gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid grid-cols-2 gap-4">
                <div className="h-[330px] rounded bg-zinc-200" />
                <div className="h-[330px] rounded bg-zinc-200" />
                <div className="h-[330px] rounded bg-zinc-200" />
                <div className="h-[330px] rounded bg-zinc-200" />
            </div>
            <div className="space-y-4">
                <div className="h-11 w-[80%] rounded bg-zinc-200" />
                <div className="h-9 w-28 rounded bg-zinc-200" />
                <div className="pt-2">
                    <SkeletonLine className="w-24" />
                    <div className="mt-3 flex gap-2">
                        <div className="size-6 rounded-full bg-zinc-200" />
                        <div className="size-6 rounded-full bg-zinc-200" />
                        <div className="size-6 rounded-full bg-zinc-200" />
                    </div>
                </div>
                <div className="pt-2">
                    <SkeletonLine className="w-20" />
                    <div className="mt-3 flex gap-2">
                        <div className="h-10 w-14 rounded bg-zinc-200" />
                        <div className="h-10 w-14 rounded bg-zinc-200" />
                        <div className="h-10 w-14 rounded bg-zinc-200" />
                    </div>
                </div>
                <div className="pt-4 flex gap-3">
                    <div className="h-12 w-44 rounded bg-zinc-200" />
                    <div className="h-12 w-44 rounded bg-zinc-200" />
                </div>
            </div>
        </div>
    );
}

function CatalogSkeleton() {
    return (
        <div className="mx-auto grid w-full max-w-[1709px] animate-pulse gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
            <div className="space-y-4 rounded border border-zinc-200 bg-white p-5">
                <div className="h-5 w-28 rounded bg-zinc-200" />
                <div className="h-10 rounded bg-zinc-200" />
                <div className="h-10 rounded bg-zinc-200" />
                <div className="h-10 rounded bg-zinc-200" />
                <div className="h-10 rounded bg-zinc-200" />
                <div className="h-10 rounded bg-zinc-200" />
            </div>
            <div>
                <div className="mb-5 flex items-center justify-between py-4">
                    <div className="h-4 w-52 rounded bg-zinc-200" />
                    <div className="h-9 w-28 rounded bg-zinc-200" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={`catalog-skeleton-${index}`} className="overflow-hidden border border-zinc-200 bg-white">
                            <div className="h-[250px] bg-zinc-200 sm:h-[320px]" />
                            <div className="space-y-2 p-4">
                                <div className="h-3.5 w-[80%] rounded bg-zinc-200" />
                                <div className="h-3.5 w-20 rounded bg-zinc-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FormSkeleton() {
    return (
        <div className="mx-auto grid w-full max-w-[1500px] animate-pulse gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <div className="space-y-4">
                <div className="h-10 w-60 rounded bg-zinc-200" />
                <div className="h-10 w-full rounded bg-zinc-200" />
                <div className="h-10 w-full rounded bg-zinc-200" />
                <div className="h-10 w-full rounded bg-zinc-200" />
                <div className="h-12 w-36 rounded bg-zinc-200" />
            </div>
            <div className="h-[520px] rounded bg-zinc-200" />
        </div>
    );
}

function MapSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1700px] animate-pulse">
            <div className="h-[520px] rounded bg-zinc-200" />
        </div>
    );
}

function NewsletterSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1200px] animate-pulse text-center">
            <div className="mx-auto h-10 w-[56%] rounded bg-zinc-200" />
            <div className="mx-auto mt-4 h-4 w-[62%] rounded bg-zinc-200" />
            <div className="mx-auto mt-4 h-4 w-[46%] rounded bg-zinc-200" />
        </div>
    );
}

function InstagramSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1700px] animate-pulse">
            <div className="mx-auto h-9 w-64 rounded bg-zinc-200" />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`ig-skeleton-${index}`} className="aspect-square rounded bg-zinc-200" />
                ))}
            </div>
        </div>
    );
}

function GenericSkeleton({ heightClass }) {
    return <div className={`mx-auto w-full max-w-[1540px] animate-pulse rounded-md bg-zinc-200 ${heightClass}`} />;
}

export default function SectionSkeleton({
    heightClass = 'h-[320px]',
    className = '',
    variant = 'generic',
}) {
    let content = <GenericSkeleton heightClass={heightClass} />;

    if (variant === 'hero') content = <HeroSkeleton />;
    if (variant === 'split') content = <SplitSkeleton />;
    if (variant === 'product') content = <ProductDetailsSkeleton />;
    if (variant === 'catalog') content = <CatalogSkeleton />;
    if (variant === 'form') content = <FormSkeleton />;
    if (variant === 'map') content = <MapSkeleton />;
    if (variant === 'newsletter') content = <NewsletterSkeleton />;
    if (variant === 'instagram') content = <InstagramSkeleton />;

    return <div className={`w-full bg-[#f5f5f3] px-5 py-8 sm:px-8 lg:px-12 ${className}`.trim()}>{content}</div>;
}
