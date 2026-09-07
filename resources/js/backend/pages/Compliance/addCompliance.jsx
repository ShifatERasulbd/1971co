import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ComplianceForm from '@/components/compliance/form';

import { useAppContext } from '@/context/AppContext';

import { createCompliancePage } from './api';

const initialForm = {
    title: '',
    terms_and_conditions: '',
    privacy_policy: '',
    shipping_and_return: '',
};

function validateForm(form) {
    const validationErrors = {};

    if (!form.title.trim()) {
        validationErrors.title = ['The title field is required.'];
    }

    return validationErrors;
}

export default function AddCompliance() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Compliance');
    }, [setPageTitle]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => {
            if (!previous[name]) {
                return previous;
            }

            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleRichTextChange = (name, html) => {
        setForm((previous) => ({
            ...previous,
            [name]: html,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createCompliancePage({
                title: form.title.trim(),
                terms_and_conditions: form.terms_and_conditions,
                privacy_policy: form.privacy_policy,
                shipping_and_return: form.shipping_and_return,
            });

            toast.success('Compliance page created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/compliance');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create compliance page.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="space-y-5">
                {requestError && <p className="text-sm text-destructive">{requestError}</p>}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <ComplianceForm
                        form={form}
                        onChange={handleChange}
                        onRichTextChange={handleRichTextChange}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/admin/compliance')}
                        isSubmitting={isSubmitting}
                        errors={errors}
                        submitLabel="Create Compliance"
                        submittingLabel="Creating..."
                    />
                </div>
            </div>
        </>
    );
}