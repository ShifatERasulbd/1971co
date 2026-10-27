import { useRef, useState } from 'react';

import { requestJson } from '@/lib/apiClient';

const CONTACT_ENDPOINT = '/api/public/wholesale-contact';
const MAX_FILE_MB = 5;
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

const FORM_LINKS = [
    { label: 'Wholesale Request Form', href: '/wholesale-request' },
];

// Must match 'categories' in config/wholesale.php
const CATEGORIES = ['Wholesale', 'Order Support', 'Other'];

const INITIAL = { name: '', email: '', phone: '', category: '', subject: '', message: '', website: '' };

// Same limits as the Laravel validation rules
const LIMITS = { name: 100, email: 150, phone: 30, subject: 150, message: 3000 };

// Instant feedback only. The server is the real check.
const NAME_REGEX = /^[\p{L}\p{M}\s.'’-]+$/u;
const PHONE_REGEX = /^[0-9+()\-.\s]{6,30}$/;
const SUSPICIOUS = /<\s*\/?\s*[a-z!]|javascript\s*:|vbscript\s*:|\bon[a-z]{3,20}\s*=|\bunion\b[\s\S]{0,20}\bselect\b|;\s*(drop|alter|truncate|delete)\b/i;
const NOT_ALLOWED = 'This field contains characters or patterns that are not allowed';

// Montserrat everywhere on this page (!important beats the site's global heading/body font)
const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
.wholesale-font, .wholesale-font * { font-family: 'Montserrat', sans-serif !important; font-stretch: normal !important; text-transform: none !important; }
.wholesale-font .uppercase { text-transform: uppercase !important; }
`;

/* ---------- ICONS ---------- */

const ICON_PATHS = {
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
    phone: ['M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M11 18h2'],
    chevron: 'M6 9l6 6 6-6',
    pencil: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
    copy: ['M9 9h10v11H9z', 'M5 15V4h10'],
    clip: 'M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7',
    arrow: 'M5 12h14m0 0-5-5m5 5-5 5',
};

function Icon({ name, className = 'size-4' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {[].concat(ICON_PATHS[name]).map((d) => (
                <path key={d} d={d} />
            ))}
        </svg>
    );
}

/* ---------- FIELD PIECES ---------- */

const boxClass = (error) =>
    `relative flex rounded-md border bg-white px-3 pb-2 pt-2 transition focus-within:border-zinc-900 ${
        error ? 'border-red-400' : 'border-zinc-300'
    }`;

const inputClass = 'w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-500';

// Bordered box: small bold label on top, input below, icon on the right
function FieldBox({ label, icon, error, className = '', children, align = 'center' }) {
    return (
        <div className={className}>
            <label className={boxClass(error)}>
                <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-zinc-900">{label}</span>
                    {children}
                </span>
                {icon && (
                    <Icon
                        name={icon}
                        className={`size-4 shrink-0 text-zinc-600 ${align === 'top' ? 'mt-3 self-start' : 'self-center'}`}
                    />
                )}
            </label>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function DarkButton({ children, className = '', ...props }) {
    return (
        <button
            type="submit"
            className={`uppercase inline-flex cursor-pointer items-center justify-center gap-3 rounded-md bg-zinc-800 px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-white transition hover:bg-zinc-950 disabled:cursor-wait disabled:opacity-60 ${className}`}
            {...props}
        >
            {children}
            <Icon name="arrow" className="size-4" />
        </button>
    );
}

function SectionTitle({ children }) {
    return (
        <div className="mb-4">
            <h2 className="uppercase text-xs font-semibold tracking-[0.18em] text-zinc-900">{children}</h2>
            <div className="mt-2 h-px w-7 bg-zinc-800" />
        </div>
    );
}

/* ---------- HELPERS ---------- */

// Laravel returns 422 { message, errors: { field: [msg] } }. Find it wherever requestJson puts it.
function extractFieldErrors(error) {
    const raw = error?.errors ?? error?.data?.errors ?? error?.payload?.errors ?? error?.response?.data?.errors;
    if (!raw || typeof raw !== 'object') return {};

    return Object.fromEntries(
        Object.entries(raw).map(([field, messages]) => [
            field === 'attachment' ? 'file' : field,
            Array.isArray(messages) ? messages[0] : String(messages),
        ]),
    );
}

const getExtension = (name = '') => name.split('.').pop()?.toLowerCase() ?? '';

/* ---------- CONTACT FORM ---------- */

function ContactForm() {
    const [values, setValues] = useState(INITIAL);
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState('');
    const fileRef = useRef(null);

    const onChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
        if (sent) setSent(false);
    };

    const pickFile = (picked) => {
        if (!picked) return;
        const typeOk = ALLOWED_TYPES.includes(picked.type) || (!picked.type && ALLOWED_EXTENSIONS.includes(getExtension(picked.name)));

        if (!typeOk || !ALLOWED_EXTENSIONS.includes(getExtension(picked.name))) {
            setErrors((prev) => ({ ...prev, file: 'Only PDF or DOC files are accepted' }));
        } else if (picked.size > MAX_FILE_MB * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, file: `File must be ${MAX_FILE_MB}MB or smaller` }));
        } else {
            setFile(picked);
            setErrors((prev) => ({ ...prev, file: undefined }));
        }
    };

    const validate = () => {
        const next = {};
        const name = values.name.trim();
        const email = values.email.trim();
        const phone = values.phone.trim();
        const subject = values.subject.trim();
        const message = values.message.trim();

        if (!name) next.name = 'Name is required';
        else if (name.length < 2) next.name = 'Name is too short';
        else if (!NAME_REGEX.test(name)) next.name = "Name may only contain letters, spaces, and . ' -";

        if (!email) next.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
        else if (SUSPICIOUS.test(email)) next.email = NOT_ALLOWED;

        if (phone && !PHONE_REGEX.test(phone)) next.phone = 'Enter a valid phone number';

        if (subject && SUSPICIOUS.test(subject)) next.subject = NOT_ALLOWED;

        if (!message) next.message = 'Please tell us about your business';
        else if (message.length < 10) next.message = 'Please write at least 10 characters';
        else if (SUSPICIOUS.test(message)) next.message = NOT_ALLOWED;

        setErrors((prev) => ({ ...next, file: prev.file }));
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setServerError('');
        setSent(false);
        if (!validate()) return;

        const body = new FormData();
        Object.entries(values).forEach(([key, value]) => body.append(key, typeof value === 'string' ? value.trim() : value));
        if (file) body.append('attachment', file);

        setSubmitting(true);
        try {
            await requestJson(CONTACT_ENDPOINT, { needsCsrf: true, method: 'POST', body });
            setSent(true);
            setValues(INITIAL);
            setFile(null);
            setErrors({});
        } catch (error) {
            const fieldErrors = extractFieldErrors(error);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors((prev) => ({ ...prev, ...fieldErrors }));
            }
            setServerError(
                error?.status === 429
                    ? 'Too many attempts. Please wait a minute and try again.'
                    : error?.message || 'Something went wrong. Please try again.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="rounded-lg border border-zinc-200 bg-[#f9f8f5] p-6 sm:p-8">
            <SectionTitle>Have Questions?</SectionTitle>
            <p className="mb-5 max-w-lg text-xs leading-relaxed text-zinc-600">
                Fill out the form below and our wholesale team will get back to you within 2 business days.
            </p>

            {sent && (
                <p role="status" className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Thank you! Your message has been sent. We will reply within 2 business days.
                </p>
            )}

            <form onSubmit={onSubmit} noValidate className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <FieldBox label="Name" icon="user" error={errors.name}>
                        <input
                            name="name"
                            value={values.name}
                            onChange={onChange}
                            maxLength={LIMITS.name}
                            autoComplete="name"
                            placeholder="Your full name"
                            className={inputClass}
                        />
                    </FieldBox>
                    <FieldBox label="Email" icon="user" error={errors.email}>
                        <input
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={onChange}
                            maxLength={LIMITS.email}
                            autoComplete="email"
                            placeholder="you@company.com"
                            className={inputClass}
                        />
                    </FieldBox>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <FieldBox label="Phone" icon="phone" error={errors.phone}>
                        <input
                            name="phone"
                            type="tel"
                            value={values.phone}
                            onChange={onChange}
                            maxLength={LIMITS.phone}
                            autoComplete="tel"
                            placeholder="(000) 000 - 0000"
                            className={inputClass}
                        />
                    </FieldBox>
                    <FieldBox label="Category" icon="chevron" error={errors.category}>
                        <select
                            name="category"
                            value={values.category}
                            onChange={onChange}
                            className={`${inputClass} cursor-pointer appearance-none ${values.category ? '' : 'text-zinc-500'}`}
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </FieldBox>
                </div>

                <FieldBox label="Subject" icon="pencil" error={errors.subject}>
                    <input
                        name="subject"
                        value={values.subject}
                        onChange={onChange}
                        maxLength={LIMITS.subject}
                        placeholder="Partnership inquiry / Product interest / etc."
                        className={inputClass}
                    />
                </FieldBox>

                {/* Honeypot: hidden from people, bots fill it in. Do not remove. */}
                <input
                    type="text"
                    name="website"
                    value={values.website}
                    onChange={onChange}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="sr-only"
                />

                <FieldBox label="Message" icon="copy" align="top" error={errors.message}>
                    <textarea
                        name="message"
                        rows={3}
                        value={values.message}
                        onChange={onChange}
                        maxLength={LIMITS.message}
                        placeholder="Tell us about your business and how we can work together."
                        className={`${inputClass} resize-none`}
                    />
                </FieldBox>

                {/* File upload */}
                <div>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileRef.current?.click()}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            pickFile(e.dataTransfer.files?.[0]);
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition ${
                            dragging ? 'border-zinc-900 bg-zinc-100' : errors.file ? 'border-red-400' : 'border-zinc-300 bg-white/60 hover:bg-white'
                        }`}
                    >
                        <Icon name="clip" className="size-5 text-zinc-700" />
                        {file ? (
                            <>
                                <p className="max-w-full truncate text-sm font-semibold text-zinc-900">{file.name}</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="text-xs text-zinc-500 underline hover:text-zinc-900"
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-semibold text-zinc-900">Upload file</p>
                                <p className="text-xs text-zinc-500">PDF or DOC, up to {MAX_FILE_MB}MB</p>
                            </>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            hidden
                            onChange={(e) => {
                                pickFile(e.target.files?.[0]);
                                e.target.value = '';
                            }}
                        />
                    </div>
                    {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}
                </div>

                {serverError && (
                    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {serverError}
                    </p>
                )}

                <DarkButton disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</DarkButton>
            </form>
        </section>
    );
}

/* ---------- PAGE ---------- */

export default function Wholesale() {
    const activePath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <main className="wholesale-font min-h-screen bg-[#ffffff] px-5 py-10 sm:px-8 lg:px-12">
            <style>{FONT_CSS}</style>

            <div className="mx-auto w-full max-w-5xl">
                <h1 className="text-6xl font-light tracking-tight text-zinc-800 sm:text-7xl">Wholesale</h1>
                <div className="mt-4 h-px w-9 bg-zinc-800" />

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-600">
                    Partner with 1971Co to bring refined menswear and timeless design to your customers. We’re selective about partnerships and committed to those who share our values.
                </p>

                <nav aria-label="Request forms" className="mt-6 flex flex-col gap-3">
                    {FORM_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            aria-current={activePath === link.href ? 'page' : undefined}
                            className="w-fit cursor-pointer text-sm font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-800 hover:underline focus:outline-none focus-visible:underline"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="mt-8">
                    <ContactForm />
                </div>
            </div>
        </main>
    );
}