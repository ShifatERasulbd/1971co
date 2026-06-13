function RulerIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
                d="M6 18 18 6m-8 0 1.5 1.5M8 8l1.5 1.5m1.5-4.5L13 6.5m1.5-4.5L16 3.5M4.5 19.5l-1-1a1.4 1.4 0 0 1 0-2l11-11a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-11 11a1.4 1.4 0 0 1-2 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function SingleProductDetailsPanel({
    product,
    selectedColor,
    onSelectColor,
    selectedSize,
    onSelectSize,
    quantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
}) {
    return (
        <div>
            <h1 className="font-serif text-[2.1rem] uppercase leading-tight tracking-[0.03em] text-zinc-900 sm:text-[2.2rem]">
                {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2.5 text-[0.95rem] text-zinc-600">
                <span className="text-[1.05rem] tracking-[0.05em] text-amber-500">★★★★★</span>
                <span>(5.0)</span>
            </div>

            <p className="mt-3 text-[2.05rem] font-medium leading-none text-zinc-900">{product.price}</p>

            <p className="mt-3.5 max-w-[52ch] text-[0.98rem] leading-7 text-zinc-600">
                {product.description}
            </p>

            <div className="mt-5 space-y-4.5">
                <div>
                    <h2 className="text-[1.05rem] font-semibold uppercase tracking-[0.05em] text-zinc-900">Color</h2>
                    <div className="mt-2.5 flex items-center gap-2.5">
                        {product.colors.map((color) => (
                            <button
                                key={color.label}
                                type="button"
                                onClick={() => onSelectColor(color.label)}
                                aria-label={`Select ${color.label} color`}
                                className={`inline-flex size-10 items-center justify-center rounded-full border-2 ${
                                    selectedColor === color.label
                                        ? 'border-zinc-950'
                                        : 'border-zinc-200 hover:border-zinc-500'
                                }`}
                            >
                                <span
                                    className="size-7 rounded-full border border-zinc-300"
                                    style={{ backgroundColor: color.value }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-[1.05rem] font-semibold uppercase tracking-[0.05em] text-zinc-900">Size</h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => onSelectSize(size)}
                                className={`inline-flex min-w-[60px] items-center justify-center border px-3 py-2.5 text-[0.95rem] font-medium uppercase ${
                                    selectedSize === size
                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                        : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <p className="mt-2.5 inline-flex items-center gap-2 text-[1rem] font-medium text-zinc-800">
                        SIZE Chart <RulerIcon />
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex h-[52px] border border-zinc-300 bg-white">
                        <button
                            type="button"
                            onClick={onDecreaseQuantity}
                            className="inline-flex w-[46px] items-center justify-center text-[1.3rem] text-zinc-700"
                        >
                            -
                        </button>
                        <span className="inline-flex w-[46px] items-center justify-center border-x border-zinc-300 text-[1.2rem] text-zinc-900">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={onIncreaseQuantity}
                            className="inline-flex w-[46px] items-center justify-center text-[1.3rem] text-zinc-700"
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-[52px] flex-1 min-w-[240px] cursor-pointer items-center justify-center bg-zinc-900 px-6 text-[1.2rem] font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                    >
                        Add To Cart
                    </button>

                    <button
                        type="button"
                        className="inline-flex size-[52px] items-center justify-center border border-zinc-300 text-[1.65rem] text-zinc-700 hover:border-zinc-600"
                        aria-label="Add to wishlist"
                    >
                        ♡
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        className="inline-flex h-[50px] flex-1 min-w-[220px] items-center justify-center bg-black text-[1.05rem] font-medium text-white"
                    >
                        Buy Now
                    </button>

                    <button
                        type="button"
                        className="inline-flex h-[50px] flex-1 min-w-[220px] items-center justify-center bg-[#4f3ed8] text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-white"
                    >
                        Start Customizing
                    </button>
                </div>

                <p className="border-t border-zinc-200 pt-2.5 text-[0.98rem] text-zinc-500">SKU: N/A</p>
            </div>
        </div>
    );
}
