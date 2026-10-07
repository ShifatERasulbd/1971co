const KNOWN_BRANDS = ['visa', 'mastercard', 'amex'];

const OTHER_BRANDS = [
    {
        id: 'discover',
        name: 'Discover',
        logo: (
            <span className="flex flex-col items-center leading-none">
                <span className="text-[0.36rem] font-black tracking-tight text-zinc-800">DISCOVER</span>
                <span className="mt-0.5 h-1.5 w-5 rounded-full bg-gradient-to-r from-[#ff6000] to-[#f9a01b]" />
            </span>
        ),
    },
    {
        id: 'diners',
        name: 'Diners Club',
        logo: (
            <span className="flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-[#0079be] bg-white">
                <span className="h-2 w-[2px] bg-[#0079be]" />
            </span>
        ),
    },
    {
        id: 'elo',
        name: 'Elo',
        logo: <span className="text-[0.7rem] font-black lowercase leading-none tracking-tighter text-zinc-900">elo</span>,
    },
    {
        id: 'jcb',
        name: 'JCB',
        logo: (
            <span className="flex gap-px">
                <span className="flex h-3.5 w-2.5 items-center justify-center rounded-sm bg-[#0b4ea2] text-[0.4rem] font-bold text-white">J</span>
                <span className="flex h-3.5 w-2.5 items-center justify-center rounded-sm bg-[#d4112f] text-[0.4rem] font-bold text-white">C</span>
                <span className="flex h-3.5 w-2.5 items-center justify-center rounded-sm bg-[#00954f] text-[0.4rem] font-bold text-white">B</span>
            </span>
        ),
    },
    {
        id: 'unionpay',
        name: 'UnionPay',
        logo: (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#e21836] via-[#00447c] to-[#007b84]">
                <span className="text-[0.36rem] font-bold leading-none tracking-tight text-white">UnionPay</span>
            </span>
        ),
    },
];

export default function CardBrandBadges({ brand }) {
    const isKnown = KNOWN_BRANDS.includes(brand);
    const isOther = brand !== 'unknown' && !isKnown;
    const isSingleBrand = brand === 'visa' || brand === 'mastercard';

    const fade = (id) => (brand !== 'unknown' && brand !== id ? 'opacity-30 grayscale' : 'opacity-100');

    return (
        <span className="flex items-center gap-1.5">
            {(!isSingleBrand || brand === 'visa') && (
                <span className={`rounded bg-[#1434cb] px-2 py-1 text-[0.65rem] font-bold italic text-white transition ${fade('visa')}`}>
                    VISA
                </span>
            )}
            {(!isSingleBrand || brand === 'mastercard') && (
                <span className={`flex h-6 w-9 items-center justify-center rounded border border-zinc-200 bg-white transition ${fade('mastercard')}`}>
                    <span className="h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
                    <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b] opacity-90" />
                </span>
            )}
            {!isSingleBrand && (
                <span className={`rounded bg-[#1f72cd] px-1.5 py-1 text-[0.6rem] font-bold text-white transition ${fade('amex')}`}>
                    AMEX
                </span>
            )}
            {!isSingleBrand && (
                <span className="group relative">
                    <button
                        type="button"
                        aria-label="Show other accepted cards"
                        onClick={(e) => e.preventDefault()}
                        className={`rounded border px-1.5 py-1 text-[0.65rem] transition ${
                            isOther ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200 text-zinc-600'
                        } ${brand !== 'unknown' && !isOther ? 'opacity-30' : ''} hover:border-zinc-900 hover:text-zinc-900`}
                    >
                        +5
                    </button>
                    <span role="tooltip" className="pointer-events-none invisible absolute bottom-full right-[-6px] z-30 mb-2 w-[168px] rounded-md bg-[#1a1a1a] p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                        <span className="flex flex-wrap gap-1.5">
                            {OTHER_BRANDS.map((item) => (
                                <span key={item.id} title={item.name} className={`flex h-5 w-8 items-center justify-center overflow-hidden rounded-[3px] bg-white transition ${brand !== 'unknown' && brand !== item.id ? 'opacity-40' : 'opacity-100'}`}>
                                    {item.logo}
                                </span>
                            ))}
                        </span>
                        <span className="absolute -bottom-1 right-[15px] h-2 w-2 rotate-45 bg-[#1a1a1a]" />
                    </span>
                </span>
            )}
        </span>
    );
}