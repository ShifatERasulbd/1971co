export default function PageSkeleton() {
    return (
        <div className="bg-white px-5 py-10 sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-[1540px] space-y-6 animate-pulse">
                <div className="h-12 w-56 rounded bg-zinc-200" />
                <div className="h-[280px] rounded-md bg-zinc-200 sm:h-[360px] lg:h-[460px]" />
                <div className="h-[220px] rounded-md bg-zinc-200" />
            </div>
        </div>
    );
}
