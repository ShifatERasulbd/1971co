import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/size/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchSize, updateSize } from './api';

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

export default function EditSize() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Size');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadSize() {
            setIsLoading(true);
            setLoadError('');

            try {
                const size = await fetchSize(id);
                if (!ignore) {
                    setForm({
                        size: size.size || '',
                        
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Size.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadSize();

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
            await updateSize(id, {
                size: form.size.trim(),
               
            });

            toast.success('Size updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/size');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update Size.';
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
        return <p className="text-sm text-muted-foreground">Loading Size...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/size')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}