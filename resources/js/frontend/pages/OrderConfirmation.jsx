import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { featuresFontClass } from '../utils/typography';

export default function OrderConfirmationPage() {
    const [searchParams] = useSearchParams();
    const orderNumber = searchParams.get('order') || '';

    return (
        <section className={`${featuresFontClass} bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:px-12 lg:py-20`}>
            <div className="mx-auto w-full max-w-[860px] rounded-[28px] border border-zinc-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-10 lg:px-14">
                <div className="flex items-start gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-7" />
                    </div>

                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Order Confirmed</p>
                        <h1 className="mt-2 font-serif text-[2.2rem] uppercase tracking-[0.03em] text-zinc-900 sm:text-[2.8rem]">
                            Thank you for your order
                        </h1>
                        <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-zinc-600">
                            Your order has been placed successfully. We&apos;ll prepare it for processing and you&apos;ll receive updates shortly.
                        </p>

                        {orderNumber ? (
                            <div className="mt-6 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
                                Order number: <span className="ml-2 font-semibold text-zinc-900">{orderNumber}</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Link
                        to="/admin/orders"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded bg-zinc-900 px-6 text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                    >
                        <ShoppingBag className="size-4" />
                        Order List
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex h-12 items-center justify-center rounded border border-zinc-300 px-6 text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-zinc-900 transition-colors hover:border-zinc-900 hover:bg-zinc-50"
                    >
                        Shop More
                    </Link>
                </div>
            </div>
        </section>
    );
}
