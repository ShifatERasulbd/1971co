import { useState } from 'react';

import { requestJson } from '@/lib/apiClient';

// Laravel route: POST /api/public/wholesale-inquiries → WholesaleApplicationController@store
const ENDPOINT = '/api/public/wholesale-inquiries';
const STORE_DESCRIPTION_MAX = 2000;

// These option values must match the lists in StoreWholesaleApplicationRequest.php
const STORE_COUNTS = ['Online Only', '1-5', '6-10', '11+'];
const YEARS_IN_BUSINESS = ['Not opened yet', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '>10'];
const BOOKING_RANGES = [
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $15,000',
    '$15,000 - $20,000',
    '$20,000 - $25,000',
    '$25,000+',
];

const INITIAL = {
    // Company Information
    companyLegalName: '',
    dba: '',
    ownerName: '',
    website: '',
    // Contact Information
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactPhone: '',
    // Location
    streetAddress: '',
    city: '',
    state: '',
    // Tell Us About Your Business
    primaryGoods: '',
    yearsInBusiness: '',
    physicalStores: '',
    projectedYear1: '',
    projectedYear2: '',
    projectedYear3: '',
    storeDescription: '',
};

const REQUIRED = {
    companyLegalName: 'Company legal name is required',
    ownerName: "Owner's name is required",
    contactName: 'Contact person name is required',
    contactEmail: 'Contact email is required',
    streetAddress: 'Street address is required',
    city: 'City is required',
    state: 'State is required',
    primaryGoods: 'Primary tangible goods is required',
    yearsInBusiness: 'Please select how many years you have been in business',
    projectedYear1: 'Please select 1st year projected bookings',
    projectedYear2: 'Please select 2nd year projected bookings',
    projectedYear3: 'Please select 3rd year projected bookings',
    storeDescription: 'Please tell us more about your company',
};

const PHONE_REGEX = /^[0-9+()\-.\s]{6,30}$/;

// Montserrat for the whole form (!important beats the site's global Bebas Neue / uppercase styles)
const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
.wholesale-form-font, .wholesale-form-font *, .wholesale-form-font ::placeholder { font-family: 'Montserrat', sans-serif !important; font-stretch: normal !important; text-transform: none !important; }
.wholesale-form-font .uppercase { text-transform: uppercase !important; }
`;

/* ---------- ICONS ---------- */

function Icon({ d, className = 'size-6' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {[].concat(d).map((path) => (
                <path key={path} d={path} />
            ))}
        </svg>
    );
}

const ICONS = {
    company: ['M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16', 'M14 10h5a1 1 0 0 1 1 1v10', 'M8 8h2M8 12h2M8 16h2M3 21h18'],
    contact: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
    location: ['M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
    business: ['M3 8h18v12H3z', 'M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2', 'M3 13h18'],
    arrow: 'M5 12h14m0 0-5-5m5 5-5 5',
    chevron: 'M6 9l6 6 6-6',
};

/* ---------- FORM PIECES ---------- */

function SectionHeader({ icon, title, subtitle }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 text-zinc-700">
                <Icon d={ICONS[icon]} className="size-7" />
            </span>
            <div>
                <h2 className="text-lg font-semibold leading-tight text-zinc-900">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
            </div>
        </div>
    );
}

function Field({ label, required, error, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </span>
            {children}
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    );
}

const inputClass = (error) =>
    `w-full rounded-md border bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 ${
        error ? 'border-red-400' : 'border-zinc-200'
    }`;

function TextField({ name, label, required, type = 'text', placeholder, values, errors, onChange, ...rest }) {
    return (
        <Field label={label} required={required} error={errors[name]}>
            <input
                type={type}
                name={name}
                value={values[name]}
                onChange={onChange}
                placeholder={placeholder}
                className={inputClass(errors[name])}
                {...rest}
            />
        </Field>
    );
}

function TextAreaField({ name, label, required, placeholder, rows = 4, maxLength, className = '', values, errors, onChange }) {
    return (
        <Field label={label} required={required} error={errors[name]} className={className}>
            <textarea
                name={name}
                rows={rows}
                value={values[name]}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`${inputClass(errors[name])} resize-y`}
            />
            {maxLength && (
                <span className="mt-1 block text-right text-[11px] text-zinc-400">
                    {values[name].length}/{maxLength}
                </span>
            )}
        </Field>
    );
}

function SelectField({ name, label, required, placeholder, options, values, errors, onChange }) {
    return (
        <Field label={label} required={required} error={errors[name]}>
            <div className="relative">
                <select
                    name={name}
                    value={values[name]}
                    onChange={onChange}
                    className={`${inputClass(errors[name])} appearance-none pr-9 ${values[name] ? '' : 'text-zinc-400'}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option} value={option} className="text-zinc-900">
                            {option}
                        </option>
                    ))}
                </select>
                <Icon d={ICONS.chevron} className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            </div>
        </Field>
    );
}

/* ---------- HELPERS ---------- */

// Laravel returns 422 { message, errors: { field: [msg] } }. Find it wherever requestJson puts it.
function extractFieldErrors(error) {
    const raw = error?.errors ?? error?.data?.errors ?? error?.payload?.errors ?? error?.response?.data?.errors;
    if (!raw || typeof raw !== 'object') return {};

    return Object.fromEntries(
        Object.entries(raw).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)]),
    );
}

/* ---------- MAIN ---------- */

export default function WholesaleInquiryForm({ onSuccess }) {
    const [values, setValues] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const validate = () => {
        const next = {};

        Object.entries(REQUIRED).forEach(([key, message]) => {
            if (!String(values[key]).trim()) next[key] = message;
        });

        if (values.contactEmail && !/^\S+@\S+\.\S+$/.test(values.contactEmail.trim())) next.contactEmail = 'Enter a valid email address';
        if (values.contactPhone && !PHONE_REGEX.test(values.contactPhone.trim())) next.contactPhone = 'Enter a valid phone number';
        if (values.storeDescription.trim() && values.storeDescription.trim().length < 10) {
            next.storeDescription = 'Please write at least 10 characters';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setServerError('');
        if (!validate()) return;

        const body = new FormData();
        Object.entries(values).forEach(([key, value]) => body.append(key, value.trim()));

        setSubmitting(true);
        try {
            await requestJson(ENDPOINT, { needsCsrf: true, method: 'POST', body });
            setDone(true);
            onSuccess?.();
        } catch (error) {
            // Show Laravel's validation messages under the matching fields
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

    const shared = { values, errors, onChange: handleChange };

    if (done) {
        return (
            <div className="wholesale-form-font w-full px-4 py-12 sm:px-8 sm:py-20">
                <style>{FONT_CSS}</style>
                <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-lg ring-1 ring-zinc-100">
                    <h2 className="text-xl font-semibold text-zinc-900">Thank you!</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        Your wholesale inquiry has been received. Our team will get back to you shortly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="wholesale-form-font w-full px-4 py-12 sm:px-8 sm:py-20">
            <style>{FONT_CSS}</style>

            <form
                onSubmit={handleSubmit}
                noValidate
                className="mx-auto w-full max-w-7xl rounded-2xl bg-white px-6 py-8 shadow-lg ring-1 ring-zinc-100 sm:px-12 sm:py-12"
            >
                {/* Company Information */}
                <section className="border-b border-zinc-100 pb-10">
                    <SectionHeader icon="company" title="Company Information" subtitle="Tell us about your company" />
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <TextField name="companyLegalName" label="Company Legal Name" required placeholder="e.g. Retail Boutique LLC" {...shared} />
                        <TextField name="dba" label="Do Business As (DBA)" placeholder="e.g. Retail Boutique" {...shared} />
                        <TextField name="ownerName" label="Owner's Name" required placeholder="e.g. John Smith" {...shared} />
                        <TextField name="website" label="Company Website" placeholder="e.g. www.retailboutique.com" {...shared} />
                    </div>
                </section>

                {/* Contact Information */}
                <section className="border-b border-zinc-100 py-10">
                    <SectionHeader icon="contact" title="Primary Contact Person Information" subtitle="Who should we get in touch with?" />
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
                        <TextField name="contactName" label="Name" required placeholder="e.g. Jane Doe" {...shared} />
                        <TextField name="contactDesignation" label="Designation" placeholder="e.g. Purchasing Manager" {...shared} />
                        <TextField name="contactEmail" label=" Email" required type="email" placeholder="e.g. jane@retailboutique.com" {...shared} />
                        <TextField name="contactPhone" label="Phone" type="tel" placeholder="e.g. (000) 000 - 0000" {...shared} />
                    </div>
                </section>

                {/* Location */}
                <section className="border-b border-zinc-100 py-10">
                    <SectionHeader icon="location" title="Business Location" subtitle="Where is your business located?" />
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <TextField name="streetAddress" label="Street Address" required placeholder="e.g. 123 Main Street" {...shared} />
                        <TextField name="city" label="City" required placeholder="e.g. Melbourne" {...shared} />
                        <TextField name="state" label="State" required placeholder="e.g. Victoria" {...shared} />
                    </div>
                </section>

                {/* Tell Us About Your Business */}
                <section className="border-b border-zinc-100 py-10">
                    <SectionHeader icon="business" title="Tell Us About Your Business" subtitle="Help us understand your business" />
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <TextField name="primaryGoods" label="What are your Primary Tangible Goods?" required placeholder="e.g. Menswear, accessories" {...shared} />
                        <SelectField name="yearsInBusiness" label="How many years have you been in business?" required placeholder="Select years in business" options={YEARS_IN_BUSINESS} {...shared} />
                        <SelectField name="physicalStores" label="How many Physical Stores do you have?" placeholder="Select an option" options={STORE_COUNTS} {...shared} />
                        <SelectField name="projectedYear1" label="1st Year Projected Wholesale Bookings" required placeholder="Select a range" options={BOOKING_RANGES} {...shared} />
                        <SelectField name="projectedYear2" label="2nd Year Projected Wholesale Bookings" required placeholder="Select a range" options={BOOKING_RANGES} {...shared} />
                        <SelectField name="projectedYear3" label="3rd Year Projected Wholesale Bookings" required placeholder="Select a range" options={BOOKING_RANGES} {...shared} />
                        <TextAreaField
                            name="storeDescription"
                            label="Please tell us more about your company"
                            required
                            rows={5}
                            maxLength={STORE_DESCRIPTION_MAX}
                            placeholder="Tell us about your company, store, brands you carry and how 1971Co fits in."
                            className="sm:col-span-2 lg:col-span-3"
                            {...shared}
                        />
                    </div>
                </section>

                {serverError && (
                    <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="uppercase mt-8 ml-auto flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-zinc-900 px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60"
                >
                    {submitting ? 'Submitting...' : 'Submit Wholesale Request'}
                    {!submitting && <Icon d={ICONS.arrow} className="size-4" />}
                </button>

                <p className="mt-3 text-center text-xs text-zinc-500">All information is kept confidential and secure.</p>
            </form>
        </div>
    );
}