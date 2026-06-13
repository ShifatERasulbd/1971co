import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/subcategory/addForm';
import { useAppContext } from '@/context/AppContext';

import { createSubCategory, fetchCategoriesForDropdown } from './api';

const initialForm = {
    name: '',
    slug: '',
    category_id: '',
    image: null,
    
};

const initialPreviews={
    image: null,
}

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

    if (!form.category_id.trim()) {
        errors.category_id = ['The category field is required.'];
    }

    return errors;
}

export default function AddSubCategory() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [previews, setPreviews] = useState(initialPreviews);

    useEffect(() => {
        return () => {
            if (previews.image) {
                URL.revokeObjectURL(previews.image);
            }
        };
    }, [previews.image]);

    useEffect(() => {
        setPageTitle('Add SubCategory');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCategories() {
            try {
                const data = await fetchCategoriesForDropdown();
                if (!ignore) {
                    setCategories(Array.isArray(data) ? data : []);
                }
            } catch (_) {
                if (!ignore) {
                    setCategories([]);
                }
            }
        }

        loadCategories();

        return () => {
            ignore = true;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'name') {
            setForm((previous) => ({
                ...previous,
                name: value,
                slug: isSlugDirty ? previous.slug : slugify(value),
            }));
        } else if (name === 'slug') {
            setIsSlugDirty(true);
            setForm((previous) => ({ ...previous, slug: value }));
        } else {
            setForm((previous) => ({ ...previous, [name]: value }));
        }

        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        const file = files && files.length > 0 ? files[0] : null;

        setForm((previous) => ({ ...previous, [name]: file }));

        if (previews[name]) {
            URL.revokeObjectURL(previews[name]);
        }

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviews((previous) => ({ ...previous, [name]: previewUrl }));
        } else {
            setPreviews((previous) => ({ ...previous, [name]: null }));
        }

        setErrors((previous) => {
                if (!previous[name]) return previous;
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
            await createSubCategory({
                name: form.name.trim(),
                slug: form.slug.trim(),
                category_id: form.category_id.trim(),
                image: form.image,
            });

            toast.success('SubCategory created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/sub-category');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create subcategory.';
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
                    categories={categories}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/sub-category')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    previews={previews}
                />
            </div>
        </div>
    );
}
