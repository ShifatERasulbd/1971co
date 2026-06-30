import { useEffect, useMemo, useRef, useState } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import { calculateShippingCost, normalizeCountryCode } from '../utils/shipping';
import { featuresFontClass } from '../utils/typography';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

const cardElementOptions = {
    hidePostalCode: true,
    style: {
        base: {
            color: '#18181b',
            fontSize: '15px',
            '::placeholder': {
                color: '#a1a1aa',
            },
        },
        invalid: {
            color: '#dc2626',
        },
    },
};

function toImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        return fallbackImage;
    }

    if (value.startsWith('http') || value.startsWith('/')) {
        return value;
    }

    return `/${value.replace(/^\/+/, '')}`;
}

function LazyCheckoutImage({ src, alt, className }) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) {
            return undefined;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '180px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const resolvedSrc = hasError ? fallbackImage : toImageUrl(src);

    return (
        <div ref={containerRef} className={`${className} overflow-hidden bg-zinc-100`}>
            {isVisible ? (
                <img
                    src={resolvedSrc}
                    alt={alt}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    onError={() => setHasError(true)}
                />
            ) : null}
        </div>
    );
}

function CheckoutForm() {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [selectedCourier, setSelectedCourier] = useState('shipstation');
    const [quotedShipping, setQuotedShipping] = useState(null);
    const [isFetchingShipping, setIsFetchingShipping] = useState(false);
    const [shippingError, setShippingError] = useState('');
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        notes: '',
    });

    if (items.length === 0) {
        return (
            <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:px-12`}>
                <div className="mx-auto w-full max-w-[900px] bg-white p-8 text-center shadow-sm">
                    <h1 className="font-monstrate text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.3rem]">
                        Checkout
                    </h1>
                    <p className="mt-4 text-zinc-600">Your cart is empty. Add products before checkout.</p>
                    <Link
                        to="/shop"
                        className="mt-6 inline-flex h-11 items-center justify-center bg-zinc-900 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                    >
                        Go To Shop
                    </Link>
                </div>
            </section>
        );
    }

    const shipping = useMemo(
        () => {
            if (selectedCourier === 'ups' && quotedShipping !== null) {
                return quotedShipping;
            }

            return calculateShippingCost({ country: form.country, state: form.state }, subtotal);
        },
        [form.country, form.state, quotedShipping, selectedCourier, subtotal],
    );
    const total = subtotal + shipping;

    const normalizedItems = useMemo(
        () =>
            items.map((item) => ({
                lineId: item.lineId,
                productId: item.productId,
                name: item.name,
                priceValue: item.priceValue,
                quantity: item.quantity,
                image: item.image,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
            })),
        [items],
    );

    function validateFormValues(values) {
        const errors = {};

        const requiredFields = {
            first_name: 'First name is required',
            last_name: 'Last name is required',
            email: 'Email is required',
            phone: 'Phone is required',
            address_line_1: 'Address line 1 is required',
            city: 'City is required',
            state: 'State is required',
            postal_code: 'Postal code is required',
            country: 'Country is required',
        };

        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!String(values[field] || '').trim()) {
                errors[field] = message;
            }
        });

        const emailValue = String(values.email || '').trim();
        if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            errors.email = 'Enter a valid email address';
        }

        return errors;
    }

    function toFieldErrors(payloadErrors) {
        if (!payloadErrors || typeof payloadErrors !== 'object') {
            return {};
        }

        return Object.fromEntries(
            Object.entries(payloadErrors).map(([field, value]) => {
                const message = Array.isArray(value) ? value[0] : value;
                return [field, String(message || 'Invalid value')];
            }),
        );
    }

    function inputClass(field) {
        return `font-monstrate h-11 w-full border px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900 transition-colors ${
            fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-zinc-200 bg-white hover:border-zinc-400'
        }`;
    }

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
        setFieldErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    }

    useEffect(() => {
        if (subtotal <= 0) {
            setQuotedShipping(0);
            setShippingError('');
            return;
        }

        if (selectedCourier !== 'ups') {
            setQuotedShipping(null);
            setShippingError('');
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsFetchingShipping(true);
            setShippingError('');

            try {
                const response = await fetch('/api/public/shipping/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        courier: 'ups',
                        subtotal,
                        city: form.city,
                        state: form.state,
                        postal_code: form.postal_code,
                        country: form.country,
                        items: normalizedItems,
                    }),
                    signal: controller.signal,
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(payload?.message || 'Unable to fetch UPS shipping charge');
                }

                setQuotedShipping(Number(payload?.shipping || 0));
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }

                setShippingError(error?.message || 'Unable to fetch UPS shipping charge');
                setQuotedShipping(calculateShippingCost({ country: form.country, state: form.state }, subtotal, 'ups'));
            } finally {
                setIsFetchingShipping(false);
            }
        }, 350);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [form.city, form.country, form.postal_code, form.state, normalizedItems, selectedCourier, subtotal]);

    async function handlePlaceOrder() {
        if (isSubmitting) {
            return;
        }

        if (!stripe || !elements) {
            toast.error('Secure payment is still loading. Please wait a moment and try again.');
            return;
        }

        const nextFieldErrors = validateFormValues(form);
        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            toast.error('Please fix the highlighted form fields');
            return;
        }

        setFieldErrors({});

        setIsSubmitting(true);
        try {
            const paymentIntentResponse = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    amount: total,
                    currency: 'usd',
                }),
            });

            const paymentIntentPayload = await paymentIntentResponse.json().catch(() => ({}));

            if (!paymentIntentResponse.ok || !paymentIntentPayload?.clientSecret) {
                toast.error(paymentIntentPayload?.message || 'Unable to initialize payment.');
                return;
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error('Payment form is not ready yet. Please try again.');
                return;
            }

            const paymentResult = await stripe.confirmCardPayment(paymentIntentPayload.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${form.first_name} ${form.last_name}`.trim(),
                        email: form.email,
                        phone: form.phone,
                        address: {
                            line1: form.address_line_1,
                            line2: form.address_line_2 || undefined,
                            city: form.city,
                            state: form.state,
                            country: normalizeCountryCode(form.country),
                        },
                    },
                },
            });

            if (paymentResult.error) {
                toast.error(paymentResult.error.message || 'Payment failed. Please check your card details.');
                return;
            }

            if (paymentResult.paymentIntent?.status !== 'succeeded') {
                toast.error('Payment was not completed. Please try again.');
                return;
            }

            const response = await fetch('/api/public/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    courier: selectedCourier,
                    items: normalizedItems,
                    subtotal,
                    shipping,
                    total,
                    payment_intent_id: paymentResult.paymentIntent.id,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (payload?.errors && typeof payload.errors === 'object') {
                    setFieldErrors(toFieldErrors(payload.errors));
                    const firstError = Object.values(payload.errors)[0];
                    const message = Array.isArray(firstError) ? firstError[0] : 'Failed to place order';
                    toast.error(String(message));
                } else {
                    toast.error(payload?.message || 'Failed to place order');
                }
                return;
            }

            const cachedInvoice = {
                order_number: String(payload?.order_number || ''),
                status: 'approved',
                first_name: String(form.firstName || ''),
                last_name: String(form.lastName || ''),
                email: String(form.email || '').trim(),
                phone: String(form.phone || ''),
                address_line_1: String(form.address1 || ''),
                address_line_2: String(form.address2 || ''),
                city: String(form.city || ''),
                state: String(form.state || ''),
                postal_code: String(form.postalCode || ''),
                country: String(form.country || ''),
                notes: String(form.notes || ''),
                items: normalizedItems,
                items_count: normalizedItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0),
                subtotal,
                shipping,
                total,
                courier_service: selectedCourier,
                courier_reference: String(payload?.courier_reference || ''),
                created_at: new Date().toISOString(),
            };

            try {
                sessionStorage.setItem('lastOrderInvoice', JSON.stringify(cachedInvoice));
                localStorage.setItem('lastOrderInvoice', JSON.stringify(cachedInvoice));
            } catch {
                // Ignore storage failures and continue normal flow.
            }

            clearCart();
            toast.success('Payment successful and order placed');
            navigate(
                `/order-confirmation?order=${encodeURIComponent(String(payload?.order_number || ''))}&email=${encodeURIComponent(String(form.email || '').trim())}`,
            );
        } catch {
            toast.error('Unable to place order right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:gap-10">
                <div className="bg-white p-5 shadow-sm sm:p-8">
                    <div className="border-b border-zinc-200 pb-5">
                        <h1 className="font-monstrate text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.3rem]">
                            Checkout
                        </h1>
                        <p className="mt-1 text-[0.85rem] text-zinc-400 uppercase tracking-[0.12em]">Complete your order</p>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-7">
                        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Contact Information</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.first_name}
                                    onChange={(event) => updateField('first_name', event.target.value)}
                                    placeholder="John"
                                    className={inputClass('first_name')}
                                />
                                {fieldErrors.first_name ? <p className="mt-1 text-xs text-red-500">{fieldErrors.first_name}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.last_name}
                                    onChange={(event) => updateField('last_name', event.target.value)}
                                    placeholder="Doe"
                                    className={inputClass('last_name')}
                                />
                                {fieldErrors.last_name ? <p className="mt-1 text-xs text-red-500">{fieldErrors.last_name}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    placeholder="john@example.com"
                                    type="email"
                                    className={inputClass('email')}
                                />
                                {fieldErrors.email ? <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={(event) => updateField('phone', event.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    type="tel"
                                    className={inputClass('phone')}
                                />
                                {fieldErrors.phone ? <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p> : null}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-8">
                        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Shipping Address</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Address Line 1 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.address_line_1}
                                    onChange={(event) => updateField('address_line_1', event.target.value)}
                                    placeholder="123 Main Street"
                                    className={inputClass('address_line_1')}
                                />
                                {fieldErrors.address_line_1 ? <p className="mt-1 text-xs text-red-500">{fieldErrors.address_line_1}</p> : null}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Address Line 2 <span className="text-zinc-300">(optional)</span>
                                </label>
                                <input
                                    value={form.address_line_2}
                                    onChange={(event) => updateField('address_line_2', event.target.value)}
                                    placeholder="Apt, suite, unit, etc."
                                    className={inputClass('address_line_2')}
                                />
                                {fieldErrors.address_line_2 ? <p className="mt-1 text-xs text-red-500">{fieldErrors.address_line_2}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.city}
                                    onChange={(event) => updateField('city', event.target.value)}
                                    placeholder="New York"
                                    className={inputClass('city')}
                                />
                                {fieldErrors.city ? <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.state}
                                    onChange={(event) => updateField('state', event.target.value)}
                                    placeholder="NY"
                                    className={inputClass('state')}
                                />
                                {fieldErrors.state ? <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Postal Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.postal_code}
                                    onChange={(event) => updateField('postal_code', event.target.value)}
                                    placeholder="10001"
                                    className={inputClass('postal_code')}
                                />
                                {fieldErrors.postal_code ? <p className="mt-1 text-xs text-red-500">{fieldErrors.postal_code}</p> : null}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.country}
                                    onChange={(event) => updateField('country', event.target.value)}
                                    placeholder="United States"
                                    className={inputClass('country')}
                                />
                                {fieldErrors.country ? <p className="mt-1 text-xs text-red-500">{fieldErrors.country}</p> : null}
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="mt-8">
                        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Order Notes</h2>
                        <div className="mt-4">
                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                Additional Notes <span className="text-zinc-300">(optional)</span>
                            </label>
                            <textarea
                                value={form.notes}
                                onChange={(event) => updateField('notes', event.target.value)}
                                placeholder="Special delivery instructions, gift messages, etc."
                                rows={3}
                                className="font-monstrate w-full resize-none border border-zinc-300 px-3 py-2.5 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                            />
                        </div>
                    </div>
                </div>

                <aside className="bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="font-monstrate text-[1.5rem] uppercase tracking-[0.05em] text-zinc-900">Order Summary</h2>

                    <div className="mt-4 rounded border border-zinc-200 p-3">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Courier Service</p>
                        <div className="mt-3 space-y-2">
                            <label className="flex cursor-pointer items-center gap-2 text-[0.85rem] text-zinc-700">
                                <input
                                    type="radio"
                                    name="courier"
                                    value="ups"
                                    checked={selectedCourier === 'ups'}
                                    onChange={() => setSelectedCourier('ups')}
                                    className="h-4 w-4 accent-zinc-900"
                                />
                                <span>Ship with UPS</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-[0.85rem] text-zinc-700">
                                <input
                                    type="radio"
                                    name="courier"
                                    value="shipstation"
                                    checked={selectedCourier === 'shipstation'}
                                    onChange={() => setSelectedCourier('shipstation')}
                                    className="h-4 w-4 accent-zinc-900"
                                />
                                <span>Ship with ShipStation</span>
                            </label>
                        </div>
                        {selectedCourier === 'ups' && isFetchingShipping ? (
                            <p className="mt-2 text-xs text-zinc-500">Fetching UPS shipment charge...</p>
                        ) : null}
                        {shippingError ? <p className="mt-2 text-xs text-amber-600">{shippingError}</p> : null}
                    </div>

                    <div className="mt-6 space-y-4">
                        {items.map((item) => (
                            <article key={item.lineId} className="flex gap-3 border border-zinc-200 p-3 sm:p-4">
                                <LazyCheckoutImage
                                    src={item.image}
                                    alt={item.name}
                                    className="h-24 w-20"
                                />

                                <div className="min-w-0 flex-1">
                                    <h2 className="line-clamp-2 text-[0.9rem] font-semibold uppercase tracking-[0.06em] text-zinc-900">
                                        {item.name}
                                    </h2>
                                    <p className="mt-1 text-[0.86rem] text-zinc-600">{item.priceLabel}</p>

                                    <div className="mt-2 flex flex-wrap gap-2 text-[0.74rem] text-zinc-500">
                                        {item.selectedColor ? <span>Color: {item.selectedColor}</span> : null}
                                        {item.selectedSize ? <span>Size: {item.selectedSize}</span> : null}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="inline-flex items-center border border-zinc-300">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                                className="inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                -
                                            </button>
                                            <span className="inline-flex h-8 min-w-9 items-center justify-center border-x border-zinc-300 px-1 text-[0.8rem] text-zinc-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                                className="inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.lineId)}
                                            className="text-[0.72rem] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900"
                                        >
                                            Remove
                                        </button>
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
                            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-[1rem] font-semibold text-zinc-900">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Payment Details</h2>
                        <div className="mt-3">
                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                Card Information <span className="text-red-500">*</span>
                            </label>
                            <div className="min-h-11 border border-zinc-200 bg-white px-3 py-3 transition-colors hover:border-zinc-400 focus-within:border-zinc-900">
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="mb-1.5 text-[0.72rem] text-black uppercase tracking-[0.16em]">
                            We Accept
                        </p>
                        <div className="overflow-hidden border border-zinc-200 bg-white">
                        <img
                            src="/cardImage.png"
                            alt="Accepted payment cards"
                            className="h-10 w-full object-contain object-center px-2"
                        />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting || !stripe || !elements || (selectedCourier === 'ups' && isFetchingShipping)}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center bg-zinc-900 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Processing Payment...' : !stripe || !elements ? 'Loading Secure Payment...' : 'Pay & Place Order'}
                    </button>
                </aside>
            </div>
        </section>
    );
}

export default function CheckoutPage() {
    const [stripePromise, setStripePromise] = useState(null);
    const [isStripeLoading, setIsStripeLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function initializeStripe() {
            try {
                const envKey = String(import.meta.env.VITE_STRIPE_KEY || '').trim();
                if (envKey) {
                    if (isMounted) {
                        setStripePromise(loadStripe(envKey));
                    }
                    return;
                }

                const response = await fetch('/api/public/stripe-config', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const payload = await response.json().catch(() => ({}));
                const runtimeKey = String(payload?.publishableKey || '').trim();

                if (isMounted && runtimeKey) {
                    setStripePromise(loadStripe(runtimeKey));
                }
            } finally {
                if (isMounted) {
                    setIsStripeLoading(false);
                }
            }
        }

        initializeStripe();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isStripeLoading) {
        return (
            <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:px-12`}>
                <div className="mx-auto w-full max-w-[900px] bg-white p-8 text-center shadow-sm">
                    <h1 className="font-monstrate text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.3rem]">
                        Checkout
                    </h1>
                    <p className="mt-4 text-zinc-600">Loading secure payment...</p>
                </div>
            </section>
        );
    }

    if (!stripePromise) {
        return (
            <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:px-12`}>
                <div className="mx-auto w-full max-w-[900px] bg-white p-8 text-center shadow-sm">
                    <h1 className="font-monstrate text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.3rem]">
                        Checkout
                    </h1>
                    <p className="mt-4 text-zinc-600">
                        Stripe is not configured. Please set STRIPE_KEY in the server environment.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}
