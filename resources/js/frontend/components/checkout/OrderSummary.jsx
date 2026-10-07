import PaymentSection from './PaymentSection';

export default function OrderSummary({
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    shippingOptions,
    isFetchingShipping,
    form,
    tax,
    isFetchingTax,
    taxError,
    total,
    paymentMethod,
    setPaymentMethod,
    cardBrand,
    numberError,
    expiryError,
    cvcError,
    nameError,
    nameOnCard,
    setNameOnCard,
    setTouchedCardFields,
    handleCardFieldChange,
    handleCardFieldBlur,
    cardBoxClass,
    useShippingAsBilling,
    setUseShippingAsBilling,
    handlePlaceOrder,
    isSubmitting,
    stripe,
    elements,
    shippingError,
    hasCompleteShippingAddress,
}) {
    return (
        <aside className="font-monstrate bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-monstrate text-[1.5rem] uppercase tracking-[0.05em] text-zinc-900">Order Summary</h2>

            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <article key={item.lineId} className="flex gap-3 border border-zinc-200 p-3 sm:p-4">
                        <div className="h-24 w-20 overflow-hidden bg-zinc-100">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="line-clamp-2 text-[0.9rem] font-semibold uppercase tracking-[0.06em] text-zinc-900">{item.name}</h2>
                            <p className="mt-1 text-[0.86rem] text-zinc-600">{item.priceLabel}</p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="inline-flex items-center border border-zinc-300">
                                    <button type="button" onClick={() => updateQuantity(item.lineId, item.quantity - 1)} className="h-8 w-8 text-zinc-700">-</button>
                                    <span className="flex h-8 min-w-9 items-center justify-center border-x border-zinc-300 px-1 text-[0.8rem]">{item.quantity}</span>
                                    <button type="button" onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="h-8 w-8 text-zinc-700">+</button>
                                </div>
                                <button type="button" onClick={() => removeFromCart(item.lineId)} className="text-[0.72rem] uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-900">Remove</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-6 space-y-3 text-[0.9rem] text-zinc-700">
                <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    {isFetchingShipping || shippingOptions.length === 0 ? (
                        <span className="select-none blur-sm">$0.00</span>
                    ) : (
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    )}
                </div>
                {String(form.state || '').trim().toUpperCase() === 'MA' && (
                    <div className="flex items-center justify-between">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-[1rem] font-semibold text-zinc-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <PaymentSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardBrand={cardBrand}
                numberError={numberError}
                expiryError={expiryError}
                cvcError={cvcError}
                nameError={nameError}
                nameOnCard={nameOnCard}
                setNameOnCard={setNameOnCard}
                setTouchedCardFields={setTouchedCardFields}
                handleCardFieldChange={handleCardFieldChange}
                handleCardFieldBlur={handleCardFieldBlur}
                cardBoxClass={cardBoxClass}
                useShippingAsBilling={useShippingAsBilling}
                setUseShippingAsBilling={setUseShippingAsBilling}
            />

            <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                    isSubmitting ||
                    !stripe ||
                    !elements ||
                    isFetchingTax ||
                    paymentMethod !== 'card' ||
                    (subtotal > 0 && hasCompleteShippingAddress && shippingError !== '') ||
                    (subtotal > 0 && hasCompleteShippingAddress && taxError !== '')
                }
                className="mt-6 inline-flex h-11 w-full items-center justify-center bg-zinc-900 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Processing Payment...' : !stripe || !elements ? 'Loading Secure Payment...' : 'Pay and place order'}
            </button>
        </aside>
    );
}