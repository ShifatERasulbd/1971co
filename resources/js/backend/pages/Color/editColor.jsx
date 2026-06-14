import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/color/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchColor, updateColor } from './api';

const initialForm = {
    name: '',
    color_code: '#000000',
};

const hexPattern = /^#[0-9A-Fa-f]{6}$/;

function validateForm(form) {
    const trimmedName = form.name.trim();
    const normalizedColorCode = form.color_code.trim();
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.name = ['The name field is required.'];
    } else if (trimmedName.length > 50) {
        validationErrors.name = ['The name must not be greater than 50 characters.'];
    }

    if (!normalizedColorCode) {
        validationErrors.color_code = ['The color code field is required.'];
    } else if (!hexPattern.test(normalizedColorCode)) {
        validationErrors.color_code = ['The color code must be a valid HEX value like #1E40AF.'];
    }

    return validationErrors;
}

export default function EditColor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Color');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadColor() {
            setIsLoading(true);
            setLoadError('');

            try {
                const color = await fetchColor(id);
                if (!ignore) {
                    setForm({
                        name: color.name || '',
                        color_code: color.color_code || '#000000',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Color.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadColor();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: name === 'color_code' ? value.toUpperCase() : value,
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
            await updateColor(id, {
                name: form.name.trim(),
                color_code: form.color_code.trim().toUpperCase(),
            });

            toast.success('Color updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/color');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update Color.';
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
        return <p className="text-sm text-muted-foreground">Loading Color...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/color')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}
