import { useEffect, useMemo, useRef, useState } from 'react';
import {
    CardCvcElement,
    CardExpiryElement,
    CardNumberElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import { normalizeCountryCode } from '../utils/shipping';
import { featuresFontClass } from '../utils/typography';
import { trackPixelEvent } from '../../utils/facebookPixel';
import { trackAddPaymentInfo, trackAddShippingInfo, trackBeginCheckout, trackPurchase } from '../../utils/dataLayer';

const fallbackImage = '';

// Set this to the real path of your Monstrate font file (must be served with CORS headers).
const MONSTRATE_FONT_URL = '/fonts/monstrate.woff2';
const STRIPE_FONT_FAMILY = 'Monstrate, Arial, sans-serif';

function roundCurrency(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return Math.round((numericValue + Number.EPSILON) * 100) / 100;
}

const baseElementStyle = {
    style: {
        base: {
            color: '#18181b',
            fontFamily: STRIPE_FONT_FAMILY,
            fontSize: '15px',
            '::placeholder': {
                color: '#71717a',
                textTransform: 'none',
            },
        },
        invalid: {
            color: '#dc2626',
        },
    },
};

const cardNumberOptions = {
    ...baseElementStyle,
    placeholder: 'Card number',
    showIcon: false,
    disableLink: true,
};
const cardExpiryOptions = { ...baseElementStyle, placeholder: 'Expiration date (MM / YY)' };
const cardCvcOptions = { ...baseElementStyle, placeholder: 'Security code' };

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

function CardBrandBadges({ brand }) {
    const isKnown = KNOWN_BRANDS.includes(brand);
    const activeOtherBrand = OTHER_BRANDS.find((item) => item.id === brand);
    const isOther = brand !== 'unknown' && !isKnown;

    // Treat Amex, Visa, and Mastercard as single brands when they are active
    const isSingleBrand = brand === 'visa' || brand === 'mastercard' || brand === 'amex' || (!isKnown && brand !== 'unknown');

    const fade = (id) =>
        brand !== 'unknown' && brand !== id ? 'opacity-30 grayscale' : 'opacity-100';

    const showVisa = !isSingleBrand || brand === 'visa';
    const showMastercard = !isSingleBrand || brand === 'mastercard';
    const showAmex = !isSingleBrand || brand === 'amex';

    return (
        <span className="flex items-center gap-1.5">
            {activeOtherBrand ? (
                <span className="flex items-center gap-1.5">
                    <span 
                        title={activeOtherBrand.name} 
                        className="flex h-6 w-9 items-center justify-center overflow-hidden rounded border border-zinc-300 bg-white shadow-sm"
                    >
                        {activeOtherBrand.logo}
                    </span>
                    <span className="text-[0.7rem] font-bold uppercase text-zinc-800">
                        {activeOtherBrand.name}
                    </span>
                </span>
            ) : (
                <>
                    {showVisa && (
                        <span className={`rounded bg-[#1434cb] px-2 py-1 text-[0.65rem] font-bold italic text-white transition ${fade('visa')}`}>
                            VISA
                        </span>
                    )}

                    {showMastercard && (
                        <span className={`flex h-6 w-9 items-center justify-center rounded border border-zinc-200 bg-white transition ${fade('mastercard')}`}>
                            <span className="h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
                            <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b] opacity-90" />
                        </span>
                    )}

                    {showAmex && (
                        <span className={`rounded bg-[#1f72cd] px-1.5 py-1 text-[0.6rem] font-bold text-white transition ${fade('amex')}`}>
                            AMEX
                        </span>
                    )}

                    {!isSingleBrand && (
                        <span className="group relative">
                            <button
                                type="button"
                                aria-label="Show other accepted cards"
                                onClick={(event) => event.preventDefault()}
                                className={`rounded border px-1.5 py-1 text-[0.65rem] transition ${
                                    isOther ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200 text-zinc-600'
                                } ${brand !== 'unknown' && !isOther ? 'opacity-30' : ''} hover:border-zinc-900 hover:text-zinc-900`}
                            >
                                +5
                            </button>

                            <span
                                role="tooltip"
                                className="pointer-events-none invisible absolute bottom-full right-[-6px] z-30 mb-2 w-[168px] rounded-md bg-[#1a1a1a] p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                            >
                                <span className="flex flex-wrap gap-1.5">
                                    {OTHER_BRANDS.map((item) => (
                                        <span
                                            key={item.id}
                                            title={item.name}
                                            className={`flex h-5 w-8 items-center justify-center overflow-hidden rounded-[3px] bg-white transition ${
                                                brand !== 'unknown' && brand !== item.id ? 'opacity-40' : 'opacity-100'
                                            }`}
                                        >
                                            {item.logo}
                                        </span>
                                    ))}
                                </span>
                                <span className="absolute -bottom-1 right-[15px] h-2 w-2 rotate-45 bg-[#1a1a1a]" />
                            </span>
                        </span>
                    )}
                </>
            )}
        </span>
    );
}

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

const CHECKOUT_SESSION_KEY = 'checkout_session_id';
let memoryCheckoutSessionId = null;

function getCheckoutSessionId() {
    if (memoryCheckoutSessionId) {
        return memoryCheckoutSessionId;
    }

    let id = null;
    try {
        id = localStorage.getItem(CHECKOUT_SESSION_KEY);
    } catch {
        // storage blocked
    }

    if (!id) {
        id = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `cs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        try {
            localStorage.setItem(CHECKOUT_SESSION_KEY, id);
        } catch {
            // storage blocked
        }
    }

    memoryCheckoutSessionId = id;
    return id;
}

function resetCheckoutSessionId() {
    memoryCheckoutSessionId = null;
    try {
        localStorage.removeItem(CHECKOUT_SESSION_KEY);
    } catch {
        // ignore
    }
}

function CheckoutForm() {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const isCartEmpty = items.length === 0;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    // Refs and state for error scrolling and blinking
    const fieldRefs = useRef({});
    const lastSavedCheckoutRef = useRef('');
    const [blinkingField, setBlinkingField] = useState(null);

    function scrollToAndBlink(fieldName) {
        const el = fieldRefs.current[fieldName];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setBlinkingField(fieldName);
            setTimeout(() => {
                setBlinkingField((prev) => (prev === fieldName ? null : prev));
            }, 2000);
        }
    }

    const [quotedShipping, setQuotedShipping] = useState(0);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShippingOptionCode, setSelectedShippingOptionCode] = useState('');
    const [isFetchingShipping, setIsFetchingShipping] = useState(false);

    const [shippingError, setShippingError] = useState('');
    const [quotedTax, setQuotedTax] = useState(0);
    const [isFetchingTax, setIsFetchingTax] = useState(false);
    const [taxError, setTaxError] = useState('');
    const [isResidentialAddress, setIsResidentialAddress] = useState(false);
    const [stateOptions, setStateOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
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

    // Billing Form State & Checkbox
    const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
    const [billingForm, setBillingForm] = useState({
        first_name: '',
        last_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
    });
    const [billingStateQuery, setBillingStateQuery] = useState('');
    const [isBillingStateOpen, setIsBillingStateOpen] = useState(false);
    const billingContainerRef = useRef(null);

    // Payment UI state
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [nameOnCard, setNameOnCard] = useState('');
    const [showCardErrors, setShowCardErrors] = useState(false);
    const [cardBrand, setCardBrand] = useState('unknown');
    const [cardStatus, setCardStatus] = useState({
        number: { complete: false, error: '' },
        expiry: { complete: false, error: '' },
        cvc: { complete: false, error: '' },
    });
    const [touchedCardFields, setTouchedCardFields] = useState({
        number: false,
        expiry: false,
        cvc: false,
        nameOnCard: false,
    });

    // State combobox
    const [stateQuery, setStateQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const lastShippingInfoEventCodeRef = useRef('');
    const hasFiredPaymentInfoEventRef = useRef(false);

    useEffect(() => {
        let ignore = false;

        async function prefillFromLoggedInProfile() {
            try {
                const response = await fetch('/api/user', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok || ignore) {
                    return;
                }

                const payload = await response.json().catch(() => null);
                if (!payload || ignore) {
                    return;
                }

                const fallbackName = String(payload?.name || '').trim();
                const fallbackNameParts = fallbackName ? fallbackName.split(/\s+/) : [];
                const fallbackFirstName = fallbackNameParts[0] || '';
                const fallbackLastName = fallbackNameParts.slice(1).join(' ');

                const profileValues = {
                    first_name: String(payload?.first_name || fallbackFirstName || '').trim(),
                    last_name: String(payload?.last_name || fallbackLastName || '').trim(),
                    email: String(payload?.email || '').trim(),
                    phone: String(payload?.phone || payload?.phone_number || '').trim(),
                    address_line_1: String(payload?.address_line_1 || payload?.address1 || '').trim(),
                    address_line_2: String(payload?.address_line_2 || payload?.address2 || '').trim(),
                    city: String(payload?.city || '').trim(),
                    state: String(payload?.state || '').trim(),
                    postal_code: String(payload?.postal_code || payload?.zip || '').trim(),
                    country: String(payload?.country || '').trim(),
                };

                if (payload?.residential !== undefined && payload?.residential !== null) {
                    setIsResidentialAddress(Boolean(payload.residential));
                }

                setForm((previous) => {
                    const next = { ...previous };
                    let changed = false;

                    Object.entries(profileValues).forEach(([field, value]) => {
                        if (!value) {
                            return;
                        }

                        const current = String(previous[field] || '').trim();
                        if (current) {
                            return;
                        }

                        next[field] = value;
                        changed = true;
                    });

                    return changed ? next : previous;
                });
            } catch {
                // Prefill is best-effort only.
            }
        }

        prefillFromLoggedInProfile();

        return () => {
            ignore = true;
        };
    }, []);

    const hasCompleteShippingAddress = useMemo(() => Boolean(
        String(form.state || '').trim()
        && String(form.city || '').trim()
        && String(form.postal_code || '').trim()
        && String(form.country || '').trim(),
    ), [form.state, form.city, form.postal_code, form.country]);

    const shipping = useMemo(() => {
        const value = Number(quotedShipping);
        return Number.isFinite(value) && value > 0 ? value : 0;
    }, [quotedShipping]);

    const tax = useMemo(() => {
        const value = Number(quotedTax);
        return Number.isFinite(value) && value > 0 ? value : 0;
    }, [quotedTax]);

    const baseTotal = useMemo(() => roundCurrency(subtotal + shipping + tax), [subtotal, shipping, tax]);
    const total = baseTotal;

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
                weight: item.weight,
                length: item.length,
                width: item.width,
                height: item.height,
            })),
        [items],
    );

    const allCardFieldsComplete =
        cardStatus.number.complete && cardStatus.expiry.complete && cardStatus.cvc.complete;

    useEffect(() => {
        if (isCartEmpty) {
            return;
        }

        trackPixelEvent('InitiateCheckout', {
            content_ids: items.map((item) => item.productId),
            content_type: 'product',
            currency: 'USD',
            value: subtotal,
            num_items: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        });
        trackBeginCheckout(normalizedItems, subtotal);
    }, []);

    useEffect(() => {
        if (allCardFieldsComplete && !hasFiredPaymentInfoEventRef.current) {
            hasFiredPaymentInfoEventRef.current = true;
            trackAddPaymentInfo(normalizedItems, total, 'card');
        }
    }, [allCardFieldsComplete, normalizedItems, total]);

    function handleCardFieldChange(field) {
        return (event) => {
            if (field === 'number') {
                setCardBrand(event?.empty ? 'unknown' : event?.brand || 'unknown');
            }

            setCardStatus((previous) => ({
                ...previous,
                [field]: {
                    complete: Boolean(event?.complete),
                    error: event?.error?.message || '',
                },
            }));
        };
    }

    function handleCardFieldBlur(field) {
        return () => {
            setTouchedCardFields((previous) => ({ ...previous, [field]: true }));
        };
    }

    function getCardError(field, emptyMessage) {
        if (cardStatus[field].error) {
            return cardStatus[field].error;
        }

        if ((showCardErrors || touchedCardFields[field]) && !cardStatus[field].complete) {
            return emptyMessage;
        }

        return '';
    }

    function cardBoxClass(hasError, isBlinking) {
        return `font-monstrate flex h-14 w-full items-center rounded-lg border bg-white px-3.5 transition-colors ${
            hasError || isBlinking
                ? 'border-red-600 ring-1 ring-red-600'
                : 'border-zinc-300 hover:border-zinc-500 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900'
        } ${isBlinking ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : ''}`;
    }

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

        const stateValue = String(values.state || '').trim();
        if (stateValue && stateOptions.length > 0) {
            const isValidState = stateOptions.some(
                (s) =>
                    s.state_code.toLowerCase() === stateValue.toLowerCase() ||
                    s.state_name.toLowerCase() === stateValue.toLowerCase()
            );
            if (!isValidState) {
                errors.state = 'Please select a valid state';
            }
        }

        return errors;
    }

    function saveCheckoutProgress(overrides = {}) {
        const values = { ...form, ...overrides };
        const filled = Object.fromEntries(
            Object.entries(values).filter(([, value]) => String(value || '').trim() !== ''),
        );

        if (Object.keys(filled).length === 0 || normalizedItems.length === 0) {
            return;
        }

        const body = JSON.stringify({
            session_id: getCheckoutSessionId(),
            ...filled,
            items: normalizedItems,
            subtotal,
            shipping,
            tax,
            total,
        });

        if (body === lastSavedCheckoutRef.current) {
            return;
        }
        lastSavedCheckoutRef.current = body;

        fetch('/api/public/checkout-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body,
            keepalive: true,
        }).catch(() => {});
    }

    function handleBlur(field) {
        return () => {
            saveCheckoutProgress();
            setTouchedFields((previous) => ({ ...previous, [field]: true }));
            const validationErrors = validateFormValues(form);
            setFieldErrors((previous) => {
                const next = { ...previous };
                if (validationErrors[field]) {
                    next[field] = validationErrors[field];
                } else {
                    delete next[field];
                }
                return next;
            });
        };
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
        const hasError = touchedFields[field] && fieldErrors[field];
        const isBlinking = blinkingField === field;
        return `font-monstrate h-11 w-full border px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:normal-case ${
            hasError || isBlinking ? 'border-red-400 bg-red-50 ring-1 ring-red-500' : 'border-zinc-200 bg-white hover:border-zinc-400'
        } ${isBlinking ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : ''}`;
    }

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
        
        const validationErrors = validateFormValues({ ...form, [field]: value });
        setFieldErrors((previous) => {
            const next = { ...previous };
            if (validationErrors[field]) {
                next[field] = validationErrors[field];
            } else {
                delete next[field];
            }
            return next;
        });
    }

    function updateBillingField(field, value) {
        setBillingForm((previous) => ({ ...previous, [field]: value }));
    }

    useEffect(() => {
        let ignore = false;

        async function loadStates() {
            setIsLoadingStates(true);

            try {
                const response = await fetch('/api/public/locations/states', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    if (!ignore) {
                        setStateOptions([]);
                    }
                    return;
                }

                const payload = await response.json().catch(() => []);
                if (!ignore) {
                    setStateOptions(Array.isArray(payload) ? payload : []);
                }
            } catch {
                if (!ignore) {
                    setStateOptions([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoadingStates(false);
                }
            }
        }

        loadStates();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        const selectedState = String(form.state || '').trim();

        if (!selectedState) {
            setCityOptions([]);
            return;
        }

        let ignore = false;
        const controller = new AbortController();

        async function loadCities() {
            setIsLoadingCities(true);

            try {
                const params = new URLSearchParams({ state: selectedState });
                const response = await fetch(`/api/public/locations/cities?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    if (!ignore) {
                        setCityOptions([]);
                    }
                    return;
                }

                const payload = await response.json().catch(() => []);
                if (!ignore) {
                    setCityOptions(Array.isArray(payload) ? payload : []);
                }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }

                if (!ignore) {
                    setCityOptions([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoadingCities(false);
                }
            }
        }

        loadCities();

        return () => {
            ignore = true;
            controller.abort();
        };
    }, [form.state]);

    useEffect(() => {
        if (subtotal <= 0) {
            setQuotedTax(0);
            setTaxError('');
            return;
        }

        if (!hasCompleteShippingAddress) {
            setQuotedTax(0);
            setTaxError('');
            return;
        }

        const controller = new AbortController();
        setIsFetchingTax(true);
        setTaxError('');
        const timer = setTimeout(async () => {
            try {
                const response = await fetch('/api/public/tax/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        subtotal,
                        shipping,
                        city: form.city,
                        state: form.state,
                        postal_code: form.postal_code,
                        country: form.country,
                        address_line_1: form.address_line_1,
                        items: normalizedItems,
                    }),
                    signal: controller.signal,
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(payload?.error || payload?.message || 'Unable to calculate tax');
                }

                setQuotedTax(Number(payload?.tax || 0));
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }

                setTaxError(error?.message || 'Unable to calculate tax');
                setQuotedTax(0);
            } finally {
                setIsFetchingTax(false);
            }
        }, 350);

        return () => {
            controller.abort();
            clearTimeout(timer);
            setIsFetchingTax(false);
        };
    }, [form.address_line_1, form.city, form.country, form.postal_code, form.state, hasCompleteShippingAddress, normalizedItems, shipping, subtotal]);

    useEffect(() => {
        const matched = stateOptions.find((s) => s.state_code === form.state || s.state_name === form.state);
        setStateQuery(matched ? `${matched.state_name} (${matched.state_code})` : form.state || '');
    }, [form.state, stateOptions]);

    useEffect(() => {
        const matched = stateOptions.find((s) => s.state_code === billingForm.state || s.state_name === billingForm.state);
        setBillingStateQuery(matched ? `${matched.state_name} (${matched.state_code})` : billingForm.state || '');
    }, [billingForm.state, stateOptions]);

    const filteredStates = stateOptions.filter((s) => {
        const q = stateQuery.toLowerCase();
        return s.state_name.toLowerCase().includes(q) || s.state_code.toLowerCase().includes(q);
    });

    const filteredBillingStates = stateOptions.filter((s) => {
        const q = billingStateQuery.toLowerCase();
        return s.state_name.toLowerCase().includes(q) || s.state_code.toLowerCase().includes(q);
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
            if (billingContainerRef.current && !billingContainerRef.current.contains(e.target)) {
                setIsBillingStateOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStateChange = (nextStateValue) => {
        setForm((previous) => ({
            ...previous,
            state: nextStateValue,
            city: '',
            postal_code: '',
        }));
        setTouchedFields((previous) => ({ ...previous, state: true }));
        const validationErrors = validateFormValues({ ...form, state: nextStateValue, city: '', postal_code: '' });
        setFieldErrors((previous) => {
            const next = { ...previous };
            if (validationErrors.state) {
                next.state = validationErrors.state;
            } else {
                delete next.state;
            }
            delete next.city;
            delete next.postal_code;
            return next;
        });
    };

    const handleBillingStateChange = (nextStateValue) => {
        setBillingForm((previous) => ({
            ...previous,
            state: nextStateValue,
            city: '',
            postal_code: '',
        }));
    };

    useEffect(() => {
        if (!hasCompleteShippingAddress || normalizedItems.length === 0) {
            setShippingOptions([]);
            setSelectedShippingOptionCode('');
            setQuotedShipping(0);
            setShippingError('');
            setIsFetchingShipping(false);
            return undefined;
        }

        const controller = new AbortController();
        setShippingError('');
        setIsFetchingShipping(true);
        const timer = setTimeout(async () => {
            const requestBody = {
                first_name: form.first_name,
                last_name: form.last_name,
                phone: form.phone,
                address_line_1: form.address_line_1,
                city: form.city,
                state: form.state,
                postal_code: form.postal_code,
                country: form.country,
                items: normalizedItems,
            };

            try {
                const response = await fetch('/api/public/shipping/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok || !payload?.success) {
                    throw new Error(payload?.message || 'Unable to calculate shipping rates');
                }

                const rates = Array.isArray(payload?.rates) ? payload.rates : [];
                setShippingOptions(rates);

                if (rates.length > 0) {
                    setSelectedShippingOptionCode(rates[0].code);
                    setQuotedShipping(Number(rates[0].price || 0));
                } else {
                    setSelectedShippingOptionCode('');
                    setQuotedShipping(0);
                }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }

                setShippingOptions([]);
                setSelectedShippingOptionCode('');
                setQuotedShipping(0);
                setShippingError(error?.message || 'Unable to calculate shipping rates');
            } finally {
                setIsFetchingShipping(false);
            }
        }, 350);

        return () => {
            controller.abort();
            clearTimeout(timer);
            setIsFetchingShipping(false);
        };
    }, [form.address_line_1, form.city, form.country, form.first_name, form.last_name, form.phone, form.postal_code, form.state, hasCompleteShippingAddress, normalizedItems]);

    useEffect(() => {
        if (!selectedShippingOptionCode || lastShippingInfoEventCodeRef.current === selectedShippingOptionCode) {
            return;
        }

        lastShippingInfoEventCodeRef.current = selectedShippingOptionCode;
        const option = shippingOptions.find((rate) => rate.code === selectedShippingOptionCode);
        trackAddShippingInfo(normalizedItems, total, option?.service_name || option?.name || selectedShippingOptionCode);
    }, [selectedShippingOptionCode, shippingOptions, normalizedItems, total]);

    if (isCartEmpty) {
        return (
            <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:px-12`}>
                <div className="mx-auto w-full max-w-[900px] bg-white p-8 text-center shadow-sm">
                    <h1 className="font-monstrate text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.3rem]">
                        Checkout
                    </h1>
                    <p className="mt-4 text-zinc-600">Your cart is empty. Add products before checkout.</p>
                    <Link
                        to="/shop"
                        className="font-monstrate mt-6 inline-flex h-11 items-center justify-center bg-zinc-900 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                    >
                        Go To Shop
                    </Link>
                </div>
            </section>
        );
    }

    async function handlePlaceOrder() {
        if (isSubmitting) {
            return;
        }

        if (paymentMethod !== 'card') {
            toast.error('This payment method is not available yet. Please use a credit card.');
            return;
        }

        if (!stripe || !elements) {
            toast.error('Secure payment is still loading. Please wait a moment and try again.');
            return;
        }

        const allFields = ['first_name', 'last_name', 'email', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
        const allTouched = {};
        allFields.forEach((f) => { allTouched[f] = true; });
        setTouchedFields(allTouched);

        setTouchedCardFields({ number: true, expiry: true, cvc: true, nameOnCard: true });

        const nextFieldErrors = validateFormValues(form);
        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            toast.error('Please fix the highlighted form fields');
            const firstErrorField = Object.keys(nextFieldErrors)[0];
            scrollToAndBlink(firstErrorField);
            return;
        }

        setShowCardErrors(true);
        if (!cardStatus.number.complete) {
            toast.error('Please complete your card number');
            scrollToAndBlink('number');
            return;
        }
        if (!cardStatus.expiry.complete) {
            toast.error('Please complete your card expiration date');
            scrollToAndBlink('expiry');
            return;
        }
        if (!cardStatus.cvc.complete) {
            toast.error('Please complete your card security code');
            scrollToAndBlink('cvc');
            return;
        }
        if (!nameOnCard.trim()) {
            toast.error('Please enter the name on your card');
            scrollToAndBlink('nameOnCard');
            return;
        }

        setFieldErrors({});

        setIsSubmitting(true);
        const fbEventId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `fb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
                    items: normalizedItems,
                }),
            });

            const paymentIntentPayload = await paymentIntentResponse.json().catch(() => ({}));

            if (!paymentIntentResponse.ok || !paymentIntentPayload?.clientSecret) {
                toast.error(paymentIntentPayload?.message || 'Unable to initialize payment.');
                return;
            }

            const cardElement = elements.getElement(CardNumberElement);
            if (!cardElement) {
                toast.error('Payment form is not ready yet. Please try again.');
                return;
            }

            const paymentResult = await stripe.confirmCardPayment(paymentIntentPayload.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: nameOnCard.trim(),
                        email: form.email,
                        phone: form.phone,
                        address: {
                            line1: useShippingAsBilling ? form.address_line_1 : billingForm.address_line_1,
                            line2: useShippingAsBilling ? (form.address_line_2 || undefined) : (billingForm.address_line_2 || undefined),
                            city: useShippingAsBilling ? form.city : billingForm.city,
                            state: useShippingAsBilling ? form.state : billingForm.state,
                            postal_code: useShippingAsBilling ? form.postal_code : billingForm.postal_code,
                            country: normalizeCountryCode(useShippingAsBilling ? form.country : billingForm.country),
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
                    courier: '',
                    residential: isResidentialAddress,
                    items: normalizedItems,
                    subtotal,
                    shipping,
                    total,
                    payment_intent_id: paymentResult.paymentIntent.id,
                    tax,
                    stripe_charge: 0,
                    fb_event_id: fbEventId,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (payload?.errors && typeof payload.errors === 'object') {
                    const mappedErrors = toFieldErrors(payload.errors);
                    setFieldErrors(mappedErrors);
                    const firstErrField = Object.keys(mappedErrors)[0];
                    if (firstErrField) {
                        scrollToAndBlink(firstErrField);
                    }
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
                first_name: String(form.first_name || ''),
                last_name: String(form.last_name || ''),
                email: String(form.email || '').trim(),
                phone: String(form.phone || ''),
                address_line_1: String(form.address_line_1 || ''),
                address_line_2: String(form.address_line_2 || ''),
                city: String(form.city || ''),
                state: String(form.state || ''),
                postal_code: String(form.postal_code || ''),
                country: String(form.country || ''),
                notes: String(form.notes || ''),
                items: normalizedItems,
                items_count: normalizedItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0),
                subtotal,
                shipping,
                tax,
                stripe_charge: 0,
                processing_fee: 0,
                total,
                courier_service: '',
                courier_reference: String(payload?.courier_reference || ''),
                created_at: new Date().toISOString(),
            };

            try {
                sessionStorage.setItem('lastOrderInvoice', JSON.stringify(cachedInvoice));
                localStorage.setItem('lastOrderInvoice', JSON.stringify(cachedInvoice));
            } catch {
                // Ignore storage failures
            }

            trackPixelEvent('Purchase', {
                content_ids: normalizedItems.map((item) => item.productId),
                content_type: 'product',
                currency: 'USD',
                value: total,
                num_items: normalizedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
                order_id: String(payload?.order_number || ''),
            }, payload?.fb_event_id || fbEventId);

            trackPurchase({
                transactionId: String(payload?.order_number || ''),
                value: total,
                tax,
                shipping,
                items: normalizedItems,
            });

            fetch('/api/public/checkout-sessions/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    session_id: getCheckoutSessionId(),
                    order_number: String(payload?.order_number || ''),
                }),
                keepalive: true,
            }).catch(() => {});
            resetCheckoutSessionId();

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

    const numberError = getCardError('number', 'Enter a card number');
    const expiryError = getCardError('expiry', 'Enter a valid expiration date');
    const cvcError = getCardError('cvc', 'Enter the security code Or CVV');
    const nameError = (showCardErrors || touchedCardFields.nameOnCard) && !nameOnCard.trim();

    return (
        <section className={`${featuresFontClass} font-monstrate bg-[#f7f7f5] px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:gap-10">
                <div className="font-monstrate bg-white p-5 shadow-sm sm:p-8">
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
                            <div ref={(el) => (fieldRefs.current['first_name'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.first_name}
                                    onChange={(event) => updateField('first_name', event.target.value)}
                                    onBlur={handleBlur('first_name')}
                                    placeholder="John"
                                    className={inputClass('first_name')}
                                />
                                {touchedFields.first_name && fieldErrors.first_name ? <p className="mt-1 text-xs text-red-500">{fieldErrors.first_name}</p> : null}
                            </div>
                            <div ref={(el) => (fieldRefs.current['last_name'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.last_name}
                                    onChange={(event) => updateField('last_name', event.target.value)}
                                    onBlur={handleBlur('last_name')}
                                    placeholder="Doe"
                                    className={inputClass('last_name')}
                                />
                                {touchedFields.last_name && fieldErrors.last_name ? <p className="mt-1 text-xs text-red-500">{fieldErrors.last_name}</p> : null}
                            </div>
                            <div ref={(el) => (fieldRefs.current['email'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    onBlur={handleBlur('email')}
                                    placeholder="john@example.com"
                                    type="email"
                                    className={inputClass('email')}
                                />
                                {touchedFields.email && fieldErrors.email ? <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p> : null}
                            </div>
                            <div ref={(el) => (fieldRefs.current['phone'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={(event) => updateField('phone', event.target.value)}
                                    onBlur={handleBlur('phone')}
                                    placeholder="+1 (555) 000-0000"
                                    type="tel"
                                    className={inputClass('phone')}
                                />
                                {touchedFields.phone && fieldErrors.phone ? <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p> : null}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-8">
                        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Shipping Address</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div ref={(el) => (fieldRefs.current['address_line_1'] = el)} className="sm:col-span-2">
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Address Line 1 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.address_line_1}
                                    onChange={(event) => updateField('address_line_1', event.target.value)}
                                    onBlur={handleBlur('address_line_1')}
                                    placeholder="123 Main Street"
                                    className={inputClass('address_line_1')}
                                />
                                {touchedFields.address_line_1 && fieldErrors.address_line_1 ? <p className="mt-1 text-xs text-red-500">{fieldErrors.address_line_1}</p> : null}
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

                            {/* State combobox */}
                            <div
                                ref={(el) => {
                                    fieldRefs.current['state'] = el;
                                    containerRef.current = el;
                                }}
                                className="relative"
                            >
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={isLoadingStates ? 'Loading states...' : stateQuery}
                                    disabled={isLoadingStates}
                                    placeholder="Type or select state"
                                    onFocus={() => setIsOpen(true)}
                                    onBlur={handleBlur('state')}
                                    onChange={(event) => {
                                        const val = event.target.value;
                                        setStateQuery(val);
                                        setIsOpen(true);
                                        handleStateChange(val);
                                    }}
                                    className={inputClass('state')}
                                />

                                {isOpen && !isLoadingStates && filteredStates.length > 0 && (
                                    <ul className="font-monstrate absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white text-sm shadow-lg">
                                        {filteredStates.map((state) => (
                                            <li
                                                key={state.state_code}
                                                onClick={() => {
                                                    handleStateChange(state.state_code);
                                                    setStateQuery(`${state.state_name} (${state.state_code})`);
                                                    setIsOpen(false);
                                                    saveCheckoutProgress({ state: state.state_code });
                                                }}
                                                className="cursor-pointer px-3 py-2 text-zinc-800 hover:bg-zinc-100"
                                            >
                                                {state.state_name} <span className="text-zinc-500">({state.state_code})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {touchedFields.state && fieldErrors.state ? <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p> : null}
                            </div>

                            <div ref={(el) => (fieldRefs.current['city'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onBlur={handleBlur('city')}
                                    onChange={(event) => {
                                        const nextCity = event.target.value;
                                        setForm((previous) => ({
                                            ...previous,
                                            city: nextCity,
                                            postal_code: '',
                                        }));

                                        const validationErrors = validateFormValues({ ...form, city: nextCity, postal_code: '' });
                                        setFieldErrors((previous) => {
                                            const next = { ...previous };
                                            if (validationErrors.city) {
                                                next.city = validationErrors.city;
                                            } else {
                                                delete next.city;
                                            }
                                            delete next.postal_code;
                                            return next;
                                        });
                                    }}
                                    placeholder={!form.state ? 'Select state first' : 'Enter city'}
                                    className={inputClass('city')}
                                    disabled={!form.state}
                                />
                                {touchedFields.city && fieldErrors.city ? <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p> : null}
                            </div>

                            <div ref={(el) => (fieldRefs.current['postal_code'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Zip Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.postal_code}
                                    onChange={(event) => updateField('postal_code', event.target.value)}
                                    onBlur={handleBlur('postal_code')}
                                    placeholder="10001"
                                    className={inputClass('postal_code')}
                                />
                                {touchedFields.postal_code && fieldErrors.postal_code ? <p className="mt-1 text-xs text-red-500">{fieldErrors.postal_code}</p> : null}
                            </div>
                            <div ref={(el) => (fieldRefs.current['country'] = el)}>
                                <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.country}
                                    onChange={(event) => updateField('country', event.target.value)}
                                    onBlur={handleBlur('country')}
                                    placeholder="United States"
                                    className={inputClass('country')}
                                    readOnly
                                />
                                {touchedFields.country && fieldErrors.country ? <p className="mt-1 text-xs text-red-500">{fieldErrors.country}</p> : null}
                            </div>

                            {/* Checkbox moved right under Zip Code and Country */}
                            <div className="sm:col-span-2 mt-2">
                                <label className="flex cursor-pointer items-center gap-2.5 text-[0.88rem] text-zinc-800">
                                    <input
                                        type="checkbox"
                                        checked={useShippingAsBilling}
                                        onChange={(event) => setUseShippingAsBilling(event.target.checked)}
                                        className="h-4 w-4 accent-zinc-900"
                                    />
                                    Use shipping address as billing address
                                </label>
                            </div>

                            {/* Conditional Billing Address Form */}
                            {!useShippingAsBilling && (
                                <div className="sm:col-span-2 mt-4 border-t border-zinc-200 pt-5">
                                    <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400 mb-4">Billing Address</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={billingForm.first_name}
                                                onChange={(event) => updateBillingField('first_name', event.target.value)}
                                                placeholder="John"
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={billingForm.last_name}
                                                onChange={(event) => updateBillingField('last_name', event.target.value)}
                                                placeholder="Doe"
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                Address Line 1 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={billingForm.address_line_1}
                                                onChange={(event) => updateBillingField('address_line_1', event.target.value)}
                                                placeholder="123 Main Street"
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                Address Line 2 <span className="text-zinc-300">(optional)</span>
                                            </label>
                                            <input
                                                value={billingForm.address_line_2}
                                                onChange={(event) => updateBillingField('address_line_2', event.target.value)}
                                                placeholder="Apt, suite, unit, etc."
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                        </div>

                                        {/* Billing State Combobox */}
                                        <div ref={billingContainerRef} className="relative">
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={isLoadingStates ? 'Loading states...' : billingStateQuery}
                                                disabled={isLoadingStates}
                                                placeholder="Type or select state"
                                                onFocus={() => setIsBillingStateOpen(true)}
                                                onChange={(event) => {
                                                    const val = event.target.value;
                                                    setBillingStateQuery(val);
                                                    setIsBillingStateOpen(true);
                                                    handleBillingStateChange(val);
                                                }}
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                            {isBillingStateOpen && !isLoadingStates && filteredBillingStates.length > 0 && (
                                                <ul className="font-monstrate absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white text-sm shadow-lg">
                                                    {filteredBillingStates.map((state) => (
                                                        <li
                                                            key={state.state_code}
                                                            onClick={() => {
                                                                handleBillingStateChange(state.state_code);
                                                                setBillingStateQuery(`${state.state_name} (${state.state_code})`);
                                                                setIsBillingStateOpen(false);
                                                            }}
                                                            className="cursor-pointer px-3 py-2 text-zinc-800 hover:bg-zinc-100"
                                                        >
                                                            {state.state_name} <span className="text-zinc-500">({state.state_code})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={billingForm.city}
                                                onChange={(event) => updateBillingField('city', event.target.value)}
                                                placeholder={!billingForm.state ? 'Select state first' : 'Enter city'}
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                                disabled={!billingForm.state}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                Zip Code <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={billingForm.postal_code}
                                                onChange={(event) => updateBillingField('postal_code', event.target.value)}
                                                placeholder="10001"
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={billingForm.country}
                                                onChange={(event) => updateBillingField('country', event.target.value)}
                                                placeholder="United States"
                                                className="font-monstrate h-11 w-full border border-zinc-200 bg-white px-3 text-[0.9rem] normal-case text-zinc-900 outline-none focus:border-zinc-900"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                className="font-monstrate w-full resize-none border border-zinc-300 px-3 py-2.5 text-[0.9rem] normal-case text-zinc-900 outline-none placeholder:normal-case focus:border-zinc-900"
                            />
                        </div>
                    </div>
                </div>

                <aside className="font-monstrate bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="font-monstrate text-[1.5rem] uppercase tracking-[0.05em] text-zinc-900">Order Summary</h2>

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
                                        {item.weight ? <span>Weight: {item.weight} Lbs</span> : null}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="inline-flex items-center border border-zinc-300">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                                className="font-monstrate inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                -
                                            </button>
                                            <span className="inline-flex h-8 min-w-9 items-center justify-center border-x border-zinc-300 px-1 text-[0.8rem] text-zinc-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                                className="font-monstrate inline-flex h-8 w-8 items-center justify-center text-zinc-700"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.lineId)}
                                            className="font-monstrate text-[0.72rem] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900"
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
                            {isFetchingShipping || shippingOptions.length === 0 ? (
                                <span className="select-none blur-sm" aria-label="Calculating shipping">
                                    $0.00
                                </span>
                            ) : (
                                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                            )}
                        </div>
                       
                    </div>

                   {/* Payment */}
{/* Payment */}
<div className="mt-8">
    <h2 className="text-[1.15rem] font-semibold text-zinc-900">Payment</h2>
    <p className="mt-1 text-[0.85rem] text-zinc-500">All transactions are secure and encrypted.</p>

    <div className="mt-4 space-y-3">
        <div
            className={`rounded-lg border ${
                paymentMethod === 'card' ? 'border-zinc-900' : 'border-zinc-300'
            }`}
        >
            <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 rounded-t-lg bg-white px-4 py-4">
                <span className="flex items-center gap-3 text-[0.9rem] font-medium text-zinc-900">
                    <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 accent-zinc-900"
                    />
                    Credit / Debit Card
                </span>
                <div className="pl-7 sm:pl-0 scale-[0.85] origin-left sm:origin-right">
                    <CardBrandBadges brand={cardBrand} />
                </div>
            </label>

            <div
                className={`space-y-3 rounded-b-lg border-t border-zinc-200 bg-zinc-100 px-4 pb-4 pt-4 ${
                    paymentMethod === 'card' ? '' : 'hidden'
                }`}
            >
                {/* Card number */}
                <div ref={(el) => (fieldRefs.current['number'] = el)}>
                    <div className={cardBoxClass(Boolean(numberError), blinkingField === 'number')}>
                        <div className="min-w-0 flex-1">
                            <CardNumberElement
                                options={{
                                    ...cardNumberOptions,
                                    placeholder: 'Card number',
                                }}
                                onChange={handleCardFieldChange('number')}
                                onBlur={handleCardFieldBlur('number')}
                            />
                        </div>
                        <svg
                            className="h-4 w-4 shrink-0 text-zinc-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="4" y="11" width="16" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                    </div>
                    {numberError ? (
                        <p className="mt-1.5 text-[0.85rem] text-red-600">{numberError}</p>
                    ) : null}
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-2 gap-3">
                    <div ref={(el) => (fieldRefs.current['expiry'] = el)}>
                        <div className={cardBoxClass(Boolean(expiryError), blinkingField === 'expiry')}>
                            <div className="min-w-0 flex-1">
                                <CardExpiryElement
                                    options={{
                                        ...cardExpiryOptions,
                                        placeholder: 'MM / YY',
                                    }}
                                    onChange={handleCardFieldChange('expiry')}
                                    onBlur={handleCardFieldBlur('expiry')}
                                />
                            </div>
                        </div>
                        {expiryError ? (
                            <p className="mt-1.5 text-[0.85rem] text-red-600">{expiryError}</p>
                        ) : null}
                    </div>
                    <div ref={(el) => (fieldRefs.current['cvc'] = el)}>
                        <div className={cardBoxClass(Boolean(cvcError), blinkingField === 'cvc')}>
                            <div className="min-w-0 flex-1">
                                <CardCvcElement
                                    options={{
                                        ...cardCvcOptions,
                                        placeholder: 'CVC',
                                    }}
                                    onChange={handleCardFieldChange('cvc')}
                                    onBlur={handleCardFieldBlur('cvc')}
                                />
                            </div>
                            <span
                                title="3 or 4 digit code on your card"
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-500 text-[0.7rem] text-zinc-600"
                            >
                                ?
                            </span>
                        </div>
                        {cvcError ? (
                            <p className="mt-1.5 text-[0.85rem] text-red-600">{cvcError}</p>
                        ) : null}
                    </div>
                </div>

                {/* Name on card */}
                <div ref={(el) => (fieldRefs.current['nameOnCard'] = el)}>
                    <div className={cardBoxClass(nameError, blinkingField === 'nameOnCard')}>
                        <div className="min-w-0 flex-1">
                            <input
                                type="text"
                                value={nameOnCard}
                                onChange={(event) => setNameOnCard(event.target.value)}
                                onBlur={() => setTouchedCardFields((prev) => ({ ...prev, nameOnCard: true }))}
                                placeholder="Name on Card"
                                autoComplete="cc-name"
                                style={{ textTransform: 'none' }}
                                className="w-full bg-transparent text-[0.95rem] text-zinc-900 outline-none placeholder:text-zinc-500 placeholder:normal-case border-none p-0 focus:ring-0"
                            />
                        </div>
                    </div>
                    {nameError ? (
                        <p className="mt-1.5 text-[0.85rem] text-red-600">Enter the name on your card</p>
                    ) : null}
                </div>
            </div>
        </div>
    </div>
</div>

                    <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={
                            isSubmitting
                            || !stripe
                            || !elements
                            || isFetchingTax
                            || paymentMethod !== 'card'
                            || (subtotal > 0 && hasCompleteShippingAddress && shippingError !== '')
                            || (subtotal > 0 && hasCompleteShippingAddress && taxError !== '')
                        }
                        className="font-monstrate mt-6 inline-flex h-11 w-full items-center justify-center bg-zinc-900 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Processing Payment...' : !stripe || !elements ? 'Loading Secure Payment...' : 'Pay and place order'}
                    </button>

                    <p className="mt-4 text-[0.75rem] text-zinc-500">
                        By placing an order, you agree to our Terms of Use and acknowledge our Privacy Policy.
                    </p>
                </aside>
            </div>
        </section>
    );
}

export default function CheckoutPage() {
    const [stripePromise, setStripePromise] = useState(null);
    const [isStripeLoading, setIsStripeLoading] = useState(true);

    const elementsOptions = useMemo(
        () => ({
            fonts: [
                {
                    family: 'Monstrate',
                    src: `url(${window.location.origin}${MONSTRATE_FONT_URL})`,
                    weight: '400',
                    style: 'normal',
                    display: 'swap',
                },
            ],
        }),
        [],
    );

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
        <Elements stripe={stripePromise} options={elementsOptions}>
            <CheckoutForm />
        </Elements>
    );
}