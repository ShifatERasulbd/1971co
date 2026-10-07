export default function ShippingSection({
    form,
    updateField,
    handleBlur,
    touchedFields,
    fieldErrors,
    inputClass,
    containerRef,
    isLoadingStates,
    stateQuery,
    setStateQuery,
    setIsOpen,
    isOpen,
    filteredStates,
    handleStateChange,
}) {
    return (
        <div className="mt-8">
            <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">Shipping Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.address_line_1}
                        onChange={(e) => updateField('address_line_1', e.target.value)}
                        onBlur={handleBlur('address_line_1')}
                        placeholder="123 Main Street"
                        className={inputClass('address_line_1')}
                    />
                    {touchedFields.address_line_1 && fieldErrors.address_line_1 && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.address_line_1}</p>
                    )}
                </div>
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Address Line 2 <span className="text-zinc-300">(optional)</span>
                    </label>
                    <input
                        value={form.address_line_2}
                        onChange={(e) => updateField('address_line_2', e.target.value)}
                        placeholder="Apt, suite, unit, etc."
                        className={inputClass('address_line_2')}
                    />
                </div>

                {/* State combobox */}
                <div className="relative" ref={containerRef}>
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
                        onChange={(e) => {
                            setStateQuery(e.target.value);
                            setIsOpen(true);
                            handleStateChange(e.target.value);
                        }}
                        className={inputClass('state')}
                    />
                    {isOpen && !isLoadingStates && filteredStates.length > 0 && (
                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white text-sm shadow-lg">
                            {filteredStates.map((state) => (
                                <li
                                    key={state.state_code}
                                    onClick={() => {
                                        handleStateChange(state.state_code);
                                        setStateQuery(`${state.state_name} (${state.state_code})`);
                                        setIsOpen(false);
                                    }}
                                    className="cursor-pointer px-3 py-2 text-zinc-800 hover:bg-zinc-100"
                                >
                                    {state.state_name} <span className="text-zinc-500">({state.state_code})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {touchedFields.state && fieldErrors.state && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.city}
                        onBlur={handleBlur('city')}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder={!form.state ? 'Select state first' : 'Enter city'}
                        className={inputClass('city')}
                        disabled={!form.state}
                    />
                    {touchedFields.city && fieldErrors.city && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.postal_code}
                        onChange={(e) => updateField('postal_code', e.target.value)}
                        onBlur={handleBlur('postal_code')}
                        placeholder="10001"
                        className={inputClass('postal_code')}
                    />
                    {touchedFields.postal_code && fieldErrors.postal_code && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.postal_code}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1.5 block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-600">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        placeholder="United States"
                        className={inputClass('country')}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}