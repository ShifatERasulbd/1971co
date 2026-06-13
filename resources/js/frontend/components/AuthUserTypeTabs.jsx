export default function AuthUserTypeTabs({ userType, onChangeUserType }) {
    return (
        <div className="mt-4 flex items-end gap-7 border-b border-zinc-200 pb-0.5 text-[0.9rem] font-semibold uppercase tracking-[0.03em]">
            <button
                type="button"
                onClick={() => onChangeUserType('normal')}
                aria-pressed={userType === 'normal'}
                className={`border-b-2 pb-2 transition-colors ${
                    userType === 'normal'
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-zinc-200 text-slate-500 hover:text-zinc-900'
                }`}
            >
                Normal User
            </button>
            <button
                type="button"
                onClick={() => onChangeUserType('corporate')}
                aria-pressed={userType === 'corporate'}
                className={`border-b-2 pb-2 transition-colors ${
                    userType === 'corporate'
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-zinc-200 text-slate-500 hover:text-zinc-900'
                }`}
            >
                Corporate User
            </button>
        </div>
    );
}
