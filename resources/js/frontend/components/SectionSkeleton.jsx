export default function SectionSkeleton({ heightClass = 'h-[320px]', className = '' }) {
    return (
        <div className={`w-full bg-[#f5f5f3] px-5 py-8 sm:px-8 lg:px-12 ${className}`.trim()}>
            <div className={`mx-auto w-full max-w-[1540px] animate-pulse rounded-md bg-zinc-200 ${heightClass}`} />
        </div>
    );
}
