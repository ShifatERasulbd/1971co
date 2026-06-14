import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/grandchild/editForm';
import { useAppContext } from '@/context/AppContext';

import {
    fetchGrandChild,
    fetchCategoriesForDropdown,
    fetchSubCategoriesForDropdown,
    updateGrandChild,
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

export default function EditGrandChild() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [grandChild, setGrandChild] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit GrandChild');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [data, categoryData, subCategoryData] = await Promise.all([
                    fetchGrandChild(id),
                    fetchCategoriesForDropdown(),
                    fetchSubCategoriesForDropdown(),
                ]);

                if (!ignore) {
                    setGrandChild(data || null);
                    setForm({
                        name: data?.name || '',
                        slug: data?.slug || '',
                        category_id: data?.category_id ? String(data.category_id) : '',
                        sub_category_id: data?.sub_category_id ? String(data.sub_category_id) : '',
                    });
                    setIsSlugDirty(false);
                    setCategories(Array.isArray(categoryData) ? categoryData : []);
                    setSubCategories(Array.isArray(subCategoryData) ? subCategoryData : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load grandchild entry.');
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

        const categoryId = String(form.category_id || '').trim();
        const subCategoryId = String(form.sub_category_id || '').trim();

        if (!form.name.trim()) {
            setErrors({ name: ['The name field is required.'] });
            return;
        }

        if (!form.slug.trim()) {
            setErrors({ slug: ['The slug field is required.'] });
            return;
        }

        if (!categoryId) {
            setErrors({ category_id: ['The category field is required.'] });
            return;
        }

        if (!subCategoryId) {
            setErrors({ sub_category_id: ['The subcategory field is required.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateGrandChild(id, {
                name: form.name.trim(),
                slug: form.slug.trim(),
                category_id: categoryId,
                sub_category_id: subCategoryId,
            });

            toast.success('GrandChild updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/grand-child');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update grandchild.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading grandchild...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                grandChild={grandChild}
                categories={categories}
                subCategories={visibleSubCategories}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/grand-child')}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update GrandChild"
                submittingLabel="Updating..."
            />
        </div>
    );
}
