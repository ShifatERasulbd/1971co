import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import ComplianceForm from '@/components/compliance/form';
import { useAppContext } from '@/context/AppContext';

import { fetchCompliancePage, updateCompliancePage } from './api';

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

export default function EditCompliance() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Compliance');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadPage() {
            setIsLoading(true);
            setLoadError('');

            try {
                const page = await fetchCompliancePage(id);
                if (!ignore) {
                    setForm({
                        title: page.title || '',
                        terms_and_conditions: page.terms_and_conditions || '',
                        privacy_policy: page.privacy_policy || '',
                        shipping_and_return: page.shipping_and_return || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load compliance page.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            ignore = true;
        };
    }, [id]);

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
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateCompliancePage(id, {
                title: form.title.trim(),
                terms_and_conditions: form.terms_and_conditions,
                privacy_policy: form.privacy_policy,
                shipping_and_return: form.shipping_and_return,
            });

            toast.success('Compliance page updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/compliance');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update compliance page.';
                setLoadError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading Compliance Page...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <ComplianceForm
                form={form}
                onChange={handleChange}
                onRichTextChange={handleRichTextChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/compliance')}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update Compliance"
                submittingLabel="Updating..."
            />
        </div>
    );
}