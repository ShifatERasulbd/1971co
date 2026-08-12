import { useEffect, useState } from 'react';

import { useAppContext } from '@/context/AppContext';

export default function EditProfile() {
    const { user, setUser, setPageTitle } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setPageTitle('Edit Profile');
    }, [setPageTitle]);

    useEffect(() => {
        if (!user) {
            return;
        }

        setForm({
            first_name: String(user.first_name || '').trim(),
            last_name: String(user.last_name || '').trim(),
            email: String(user.email || '').trim(),
            password: '',
            password_confirmation: '',
        });
    }, [user]);

    const handleFieldChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const payload = {
                first_name: String(form.first_name || '').trim(),
                last_name: String(form.last_name || '').trim(),
                email: String(form.email || '').trim(),
                password: String(form.password || ''),
                password_confirmation: String(form.password_confirmation || ''),
            };

            if (!payload.password) {
                delete payload.password;
                delete payload.password_confirmation;
            }

            const response = await fetch('/api/customer/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const firstValidationError = data?.errors
                    ? Object.values(data.errors)[0]?.[0]
                    : null;
                setError(firstValidationError || data?.message || 'Unable to update profile.');
                return;
            }

            if (data?.user) {
                setUser(data.user);
            }

            setForm((previous) => ({
                ...previous,
                password: '',
                password_confirmation: '',
            }));
            setSuccess(data?.message || 'Profile updated successfully.');
        } catch {
            setError('Unable to update profile right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="text-sm text-zinc-500">Loading profile...</div>;
    }

    return (
        <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-base font-semibold text-zinc-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-zinc-600">Update your account details below.</p>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">First Name</label>
                    <input
                        type="text"
                        value={form.first_name}
                        onChange={(event) => handleFieldChange('first_name', event.target.value)}
                        className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Last Name</label>
                    <input
                        type="text"
                        value={form.last_name}
                        onChange={(event) => handleFieldChange('last_name', event.target.value)}
                        className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(event) => handleFieldChange('email', event.target.value)}
                        className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">New Password (optional)</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => handleFieldChange('password', event.target.value)}
                        className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                        placeholder="Leave blank to keep current password"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Confirm New Password</label>
                    <input
                        type="password"
                        value={form.password_confirmation}
                        onChange={(event) => handleFieldChange('password_confirmation', event.target.value)}
                        className="h-10 w-full rounded border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                    />
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-10 items-center rounded bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
