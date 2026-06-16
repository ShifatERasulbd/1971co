import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';

import { fetchOrder, updateOrder } from './api';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function Field({ label, required, error, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function EditOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [isLoading, setIsLoading]   = useState(true);
    const [isSaving, setIsSaving]     = useState(false);
    const [order, setOrder]           = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
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
        country: '',
        notes: '',
        status: 'pending',
    });

    useEffect(() => {
        setPageTitle('Edit Order');
    }, [setPageTitle]);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        fetchOrder(id)
            .then((data) => {
                if (cancelled) return;
                setOrder(data);
                setForm({
                    first_name:     data.first_name     ?? '',
                    last_name:      data.last_name      ?? '',
                    email:          data.email          ?? '',
                    phone:          data.phone          ?? '',
                    address_line_1: data.address_line_1 ?? '',
                    address_line_2: data.address_line_2 ?? '',
                    city:           data.city           ?? '',
                    state:          data.state          ?? '',
                    postal_code:    data.postal_code    ?? '',
                    country:        data.country        ?? '',
                    notes:          data.notes          ?? '',
                    status:         data.status         ?? 'pending',
                });
            })
            .catch((err) => {
                if (cancelled) return;
                toast.error(err.message || 'Failed to load order');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [id]);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function inputCls(field) {
        return `h-9 w-full rounded border px-3 text-sm text-zinc-900 outline-none focus:border-zinc-700 ${
            fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-zinc-300 bg-white'
        }`;
    }

    async function handleSave() {
        if (isSaving) return;
        setIsSaving(true);
        setFieldErrors({});

        try {
            await updateOrder(id, form);
            toast.success('Order updated');
            navigate('/admin/orders');
        } catch (err) {
            if (err.payload?.errors) {
                const mapped = {};
                Object.entries(err.payload.errors).forEach(([key, val]) => {
                    mapped[key] = Array.isArray(val) ? val[0] : val;
                });
                setFieldErrors(mapped);
                toast.error('Please fix the highlighted fields');
            } else {
                toast.error(err.message || 'Failed to save order');
            }
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <div className="px-6 py-10 text-center text-sm text-zinc-400">Loading order…</div>;
    }

    if (!order) {
        return <div className="px-6 py-10 text-center text-sm text-zinc-400">Order not found.</div>;
    }

    return (
        <div className="px-4 py-6 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-900">Edit Order</h1>
                    <p className="mt-0.5 text-sm text-zinc-500 font-mono">{order.order_number}</p>
                </div>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="text-sm text-zinc-500 hover:text-zinc-800"
                >
                    ← Back to Orders
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Left: form */}
                <div className="space-y-6">
                    {/* Contact */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Contact Information</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="First Name" required error={fieldErrors.first_name}>
                                <input value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} className={inputCls('first_name')} />
                            </Field>
                            <Field label="Last Name" required error={fieldErrors.last_name}>
                                <input value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} className={inputCls('last_name')} />
                            </Field>
                            <Field label="Email" required error={fieldErrors.email}>
                                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputCls('email')} />
                            </Field>
                            <Field label="Phone" error={fieldErrors.phone}>
                                <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputCls('phone')} />
                            </Field>
                        </div>
                    </section>

                    {/* Shipping */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Shipping Address</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Address Line 1" required error={fieldErrors.address_line_1}>
                                <input value={form.address_line_1} onChange={(e) => updateField('address_line_1', e.target.value)} className={`${inputCls('address_line_1')} sm:col-span-2`} />
                            </Field>
                            <Field label="Address Line 2" error={fieldErrors.address_line_2}>
                                <input value={form.address_line_2} onChange={(e) => updateField('address_line_2', e.target.value)} className={inputCls('address_line_2')} />
                            </Field>
                            <Field label="City" required error={fieldErrors.city}>
                                <input value={form.city} onChange={(e) => updateField('city', e.target.value)} className={inputCls('city')} />
                            </Field>
                            <Field label="State" error={fieldErrors.state}>
                                <input value={form.state} onChange={(e) => updateField('state', e.target.value)} className={inputCls('state')} />
                            </Field>
                            <Field label="Postal Code" error={fieldErrors.postal_code}>
                                <input value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} className={inputCls('postal_code')} />
                            </Field>
                            <Field label="Country" error={fieldErrors.country}>
                                <input value={form.country} onChange={(e) => updateField('country', e.target.value)} className={inputCls('country')} />
                            </Field>
                        </div>
                    </section>

                    {/* Notes */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</h2>
                        <textarea
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            rows={4}
                            className="w-full resize-none rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-700"
                        />
                    </section>
                </div>

                {/* Right: order meta + items */}
                <div className="space-y-5">
                    {/* Status */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Status</h2>
                        <select
                            value={form.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className="h-9 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-700"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="mt-4 h-9 w-full rounded bg-zinc-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                        >
                            {isSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </section>

                    {/* Order summary */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Summary</h2>
                        <div className="space-y-1 text-sm text-zinc-700">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Subtotal</span>
                                <span>${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Shipping</span>
                                <span>{Number(order.shipping) === 0 ? 'Free' : `$${Number(order.shipping).toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold text-zinc-900">
                                <span>Total</span>
                                <span>${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Items */}
                    <section className="rounded border border-zinc-200 bg-white p-5">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Items ({order.items_count})
                        </h2>
                        <div className="space-y-3">
                            {(order.items ?? []).map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                                    {item.image && (
                                        <img
                                            src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`}
                                            alt={item.name}
                                            className="h-14 w-12 flex-shrink-0 rounded object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1 text-sm">
                                        <p className="font-medium text-zinc-800 leading-tight">{item.name}</p>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                                            {item.selectedColor && item.selectedSize ? ' · ' : ''}
                                            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-xs text-zinc-500">Qty: {item.quantity}</span>
                                            <span className="text-xs font-medium text-zinc-800">${Number(item.priceValue ?? 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
