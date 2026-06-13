const MOCKUP_VARIANTS = [
    { id: 'front-design', label: 'Front Design', view: 'front', tone: 'bg-zinc-50', frame: 'shadow-md', rotation: '0deg', width: '48%', filter: 'none' },
    { id: 'back-design', label: 'Back Design', view: 'back', tone: 'bg-zinc-50', frame: 'shadow-md', rotation: '0deg', width: '48%', filter: 'none' },
];

function MockupCard({ variant, designUrl }) {
    return (
        <article className={`overflow-hidden rounded-2xl border border-zinc-200 ${variant.tone}`}>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(244,244,245,0.9)_55%,rgba(228,228,231,0.85))]">
                {designUrl ? (
                    <img
                        src={designUrl}
                        alt={`${variant.label} design`}
                        className={`absolute left-1/2 top-1/2 h-auto object-contain ${variant.frame}`}
                        style={{
                            width: variant.width,
                            transform: `translate(-50%, -50%) rotate(${variant.rotation})`,
                            borderRadius: '8px',
                            filter: variant.filter,
                        }}
                    />
                ) : (
                    <div
                        className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-zinc-400 bg-white/80 text-xs font-medium text-zinc-600"
                        style={{
                            transform: `translate(-50%, -50%) rotate(${variant.rotation})`,
                        }}
                    >
                        No design
                    </div>
                )}
            </div>
            <div className="border-t border-zinc-200 bg-white px-3 py-2">
                <p className="text-sm font-medium text-zinc-800">{variant.label}</p>
                <p className="text-xs text-zinc-500 capitalize">{variant.view} view</p>
            </div>
        </article>
    );
}

export default function MockupPreviewGrid({ frontImageUrl, backImageUrl }) {
    return (
        <section className="grid gap-4 sm:grid-cols-2">
            {MOCKUP_VARIANTS.map((variant) => (
                <MockupCard
                    key={variant.id}
                    variant={variant}
                    designUrl={variant.view === 'back' ? backImageUrl : frontImageUrl}
                />
            ))}
        </section>
    );
}
