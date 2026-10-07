export default function ContactSection({ form, updateField, handleBlur, touchedFields, fieldErrors, inputClass }) {
    return (
        <div className="mt-7">
            <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Contact Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        onBlur={handleBlur('first_name')}
                        placeholder="John"
                        className={inputClass('first_name')}
                    />
                    {touchedFields.first_name && fieldErrors.first_name && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.first_name}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        onBlur={handleBlur('last_name')}
                        placeholder="Doe"
                        className={inputClass('last_name')}
                    />
                    {touchedFields.last_name && fieldErrors.last_name && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.last_name}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        onBlur={handleBlur('email')}
                        placeholder="john@example.com"
                        type="email"
                        className={inputClass('email')}
                    />
                    {touchedFields.email && fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        onBlur={handleBlur('phone')}
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        className={inputClass('phone')}
                    />
                    {touchedFields.phone && fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                    )}
                </div>
            </div>
        </div>
    );
}