import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/category/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchCategory, updateCategory } from './api';

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

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Category');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchCategory(id);

                if (!ignore) {
                    setForm({
                        name: data?.name || '',
                        slug: data?.slug || '',
                        show_homepage: Boolean(data?.show_homepage),
                    });
                    setIsSlugDirty(false);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load category.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [id]);

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

        if (!form.name.trim()) {
            setErrors({ name: ['The name field is required.'] });
            return;
        }

        if (!form.slug.trim()) {
            setErrors({ slug: ['The slug field is required.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateCategory(id, {
                name: form.name.trim(),
                slug: form.slug.trim(),
                show_homepage: Boolean(form.show_homepage),
            });

            toast.success('Category updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/category');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update category.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading category...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/category')}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update Category"
                submittingLabel="Updating..."
            />
        </div>
    );
}

