import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/grandchild/addForm';
import { useAppContext } from '@/context/AppContext';

import {
    createGrandChild,
    fetchCategoriesForDropdown,
    fetchSubCategoriesForDropdown,
} from './api';

const initialForm = {
    name: '',
    slug: '',
    category_id: '',
    sub_category_id: '',
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

    if (!form.category_id.trim()) {
        errors.category_id = ['The category field is required.'];
    }

    if (!form.sub_category_id.trim()) {
        errors.sub_category_id = ['The subcategory field is required.'];
    }

    return errors;
}

export default function AddGrandChild() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add GrandChild');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadDropdowns() {
            try {
                const [categoryData, subCategoryData] = await Promise.all([
                    fetchCategoriesForDropdown(),
                    fetchSubCategoriesForDropdown(),
                ]);

                if (!ignore) {
                    setCategories(Array.isArray(categoryData) ? categoryData : []);
                    setSubCategories(Array.isArray(subCategoryData) ? subCategoryData : []);
                }
            } catch (_) {
                if (!ignore) {
                    setCategories([]);
                    setSubCategories([]);
                }
            }
        }

        loadDropdowns();

        return () => {
            ignore = true;
        };
    }, []);

    const visibleSubCategories = useMemo(() => {
        if (!form.category_id) {
            return subCategories;
        }

        return subCategories.filter(
            (item) => Number(item?.category_id) === Number(form.category_id)
        );
    }, [form.category_id, subCategories]);

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
        } else if (name === 'category_id') {
            setForm((previous) => ({
                ...previous,
                category_id: value,
                sub_category_id: '',
            }));
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
            await createGrandChild({
                name: form.name.trim(),
                slug: form.slug.trim(),
                category_id: form.category_id.trim(),
                sub_category_id: form.sub_category_id.trim(),
            });

            toast.success('GrandChild created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/grand-child');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create grandchild.';
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
                    subCategories={visibleSubCategories}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/grand-child')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </div>
    );
}
