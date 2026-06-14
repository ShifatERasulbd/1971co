import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/size/addForm';

import { useAppContext } from '@/context/AppContext';

import { createSize } from './api';

const initialForm = {
    size: '',
   
};

function validateForm(form) {
    const trimmedSize = form.size.trim();
   
    const validationErrors = {};

    if (!trimmedSize) {
        validationErrors.size = ['The size field is required.'];
    } else if (trimmedSize.length > 20) {
        validationErrors.size = ['The size must not be greater than 20 characters.'];
    }

    return validationErrors;
}

export default function AddSize() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Size');
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
            await createSize({
                size: form.size.trim(),
            });

            toast.success('Size created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/size');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Size.';
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
                    <AddForm
                        form={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/admin/size')}
                        isSubmitting={isSubmitting}
                        errors={errors}
                    />
                </div>
            </div>
        </>
    );
}