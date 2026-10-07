import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import CardBrandBadges from './CardBrandBadges';

export default function PaymentSection({
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
}) {
    return (
        <div className="mt-8">
            <h2 className="text-[1.15rem] font-semibold text-zinc-900">Payment</h2>
            <p className="mt-1 text-[0.85rem] text-zinc-500">All transactions are secure and encrypted.</p>

            <div className="mt-4 space-y-3">
                <div className={`rounded-lg border ${paymentMethod === 'card' ? 'border-zinc-900' : 'border-zinc-300'}`}>
                    <label className="flex cursor-pointer items-center justify-between rounded-t-lg bg-white px-4 py-4">
                        <span className="flex items-center gap-3 text-[0.9rem] font-medium text-zinc-900">
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'card'}
                                onChange={() => setPaymentMethod('card')}
                                className="h-4 w-4 accent-zinc-900"
                            />
                            Credit card
                        </span>
                        <CardBrandBadges brand={cardBrand} />
                    </label>

                    <div className={`space-y-3 rounded-b-lg border-t border-zinc-200 bg-zinc-100 px-4 pb-4 pt-4 ${paymentMethod === 'card' ? '' : 'hidden'}`}>
                        {/* Card Number */}
                        <div>
                            <div className={cardBoxClass(Boolean(numberError))}>
                                <div className="min-w-0 flex-1">
                                    <CardNumberElement options={{ placeholder: 'Card number', showIcon: false, disableLink: true }} onChange={handleCardFieldChange('number')} onBlur={handleCardFieldBlur('number')} />
                                </div>
                                <svg className="h-4 w-4 shrink-0 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="11" width="16" height="10" rx="2" />
                                    <path d="M8 11V7a4 4 0 018 0v4" />
                                </svg>
                            </div>
                            {numberError && <p className="mt-1.5 text-[0.85rem] text-red-600">{numberError}</p>}
                        </div>

                        {/* Expiry & CVC */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className={cardBoxClass(Boolean(expiryError))}>
                                    <div className="min-w-0 flex-1">
                                        <CardExpiryElement options={{ placeholder: 'Expiration date (MM / YY)' }} onChange={handleCardFieldChange('expiry')} onBlur={handleCardFieldBlur('expiry')} />
                                    </div>
                                </div>
                                {expiryError && <p className="mt-1.5 text-[0.85rem] text-red-600">{expiryError}</p>}
                            </div>
                            <div>
                                <div className={cardBoxClass(Boolean(cvcError))}>
                                    <div className="min-w-0 flex-1">
                                        <CardCvcElement options={{ placeholder: 'Security code' }} onChange={handleCardFieldChange('cvc')} onBlur={handleCardFieldBlur('cvc')} />
                                    </div>
                                </div>
                                {cvcError && <p className="mt-1.5 text-[0.85rem] text-red-600">{cvcError}</p>}
                            </div>
                        </div>

                        {/* Name on card */}
                        <div>
                            <input
                                type="text"
                                value={nameOnCard}
                                onChange={(e) => setNameOnCard(e.target.value)}
                                onBlur={() => setTouchedCardFields((prev) => ({ ...prev, nameOnCard: true }))}
                                placeholder="Name on card"
                                autoComplete="cc-name"
                                className={`${cardBoxClass(nameError)} text-[0.95rem] text-zinc-900 outline-none placeholder:text-zinc-500`}
                            />
                            {nameError && <p className="mt-1.5 text-[0.85rem] text-red-600">Enter the name on your card</p>}
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5 text-[0.88rem] text-zinc-800">
                            <input
                                type="checkbox"
                                checked={useShippingAsBilling}
                                onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                                className="h-4 w-4 accent-zinc-900"
                            />
                            Use shipping address as billing address
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}