import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/products/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchProduct, updateProduct } from './api';

const initialForm = {
    name: '',
    sku: '',
    color: '',
    size: '',
    description: '',
    long_description: '',
    additional_information: '',
    price: '',
    cover_image: '',
    category_id: '',
    subcategory_id: '',
    stock: '',
};

export default function EditProduct() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [variantRows, setVariantRows] = useState(() => {
        const variants = location.state?.productGroup?.variants || [];

        return variants.map((variant, index) => ({
            id: variant?.id ?? `variant-${index}`,
            sku: variant?.sku || '',
            color: Array.isArray(variant?.color)
                ? variant.color.filter(Boolean).join(', ')
                : (variant?.color || ''),
            size: variant?.size || '',
            stock: variant?.stock ?? 0,
            price: variant?.price ?? 0,
        }));
    });
    const isGroupEdit = Boolean(location.state?.productGroup?.isGroupEdit && variantRows.length > 0);

    useEffect(() => {
        setPageTitle('Edit Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadProduct() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchProduct(id);
                if (!ignore) {
                    setForm({
                        name: data?.name || '',
                        sku: data?.sku || '',
                        color: data?.color || '',
                        size: data?.size || '',
                        description: data?.description || '',
                        long_description: data?.long_description || '',
                        additional_information: data?.additional_information || '',
                        price: data?.price ?? '',
                        cover_image: data?.cover_image || '',
                        category_id: data?.category_id ?? '',
                        subcategory_id: data?.subcategory_id ?? '',
                        stock: data?.stock ?? '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load product.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadProduct();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleVariantChange = (index, field, value) => {
        setVariantRows((previous) =>
            previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setErrors({ name: ['The name field is required.'] });
            return;
        }

        if (!form.sku.trim()) {
            setErrors({ sku: ['The SKU field is required.'] });
            return;
        }

        if (form.price === '' || Number.isNaN(Number(form.price))) {
            setErrors({ price: ['The price field is required.'] });
            return;
        }

        if (form.stock === '' || Number.isNaN(Number(form.stock))) {
            setErrors({ stock: ['The stock field is required.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            if (isGroupEdit) {
                for (const row of variantRows) {
                    if (!row.sku?.trim()) {
                        throw new Error('Each variant must have a SKU.');
                    }

                    if (row.price === '' || Number.isNaN(Number(row.price))) {
                        throw new Error('Each variant must have a valid price.');
                    }

                    if (row.stock === '' || Number.isNaN(Number(row.stock))) {
                        throw new Error('Each variant must have a valid stock value.');
                    }
                }

                await Promise.all(
                    variantRows.map((row) =>
                        updateProduct(row.id, {
                            ...form,
                            sku: row.sku.trim(),
                            color: row.color?.trim() || '',
                            size: row.size?.trim() || '',
                            price: Number(row.price),
                            stock: Number(row.stock),
                        }),
                    ),
                );
            } else {
                await updateProduct(id, form);
            }

            toast.success('Product updated successfully', {
                style: {
                    color: '#16a34a',
                },
            });
            navigate('/admin/products');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update product.';
                setLoadError(message);
                toast.error(message, {
                    style: {
                        color: '#dc2626',
                    },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading product...</p>;
    }

    return (
        <div className="space-y-5">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <EditForm
                    form={form}
                    variantRows={variantRows}
                    variantGroupName={location.state?.productGroup?.groupName || form.name || ''}
                    onVariantChange={handleVariantChange}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/products')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    submitLabel="Update Product"
                    submittingLabel="Updating..."
                />
            </div>
        </div>
    );
}
