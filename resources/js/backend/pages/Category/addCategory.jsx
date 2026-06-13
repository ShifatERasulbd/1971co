import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/category/addForm';
import { useAppContext } from '@/context/AppContext';

import { createCategory } from './api';
    
const initialForm = {
    name: '',
    slug: '',
    show_homepage: false,
};

function slugify(value = '') {
    return value
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}



function validateForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = ['The name field is required.'];
    }

    if (!form.slug.trim()) {
        errors.slug = ['The slug field is required.'];
    }

    return errors;
}

export default function AddCategory() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Category');
    }, [setPageTitle]);

    const handleChange = (event) => {
        const { name, type, value, checked } = event.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        if (name === 'name') {
            setForm((previous) => ({
                ...previous,
                name: fieldValue,
                slug: isSlugDirty ? previous.slug : slugify(fieldValue),
            }));
        } else if (name === 'slug') {
            setIsSlugDirty(true);
            setForm((previous) => ({ ...previous, slug: fieldValue }));
        } else {
            setForm((previous) => ({ ...previous, [name]: fieldValue }));
        }

        setErrors((previous) => {
            if (name === 'name' && !previous.name && !previous.slug) {
                return previous;
            }

            if (name !== 'name' && !previous[name]) {
                return previous;
            }

            const next = { ...previous };

            if (name === 'name') {
                delete next.name;
                delete next.slug;
            } else {
                delete next[name];
            }

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
            await createCategory({
                name: form.name.trim(),
                slug: form.slug.trim(),
                show_homepage: Boolean(form.show_homepage),
            });

            toast.success('Category created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/category');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create category.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/category')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </div>
    );
}
