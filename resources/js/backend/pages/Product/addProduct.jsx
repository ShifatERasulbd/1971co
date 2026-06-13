import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/products/addForm';
import { useAppContext } from '@/context/AppContext';

import { createProduct } from './api';

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

function validateForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = ['The name field is required.'];
    }

    if (!form.sku.trim()) {
        errors.sku = ['The SKU field is required.'];
    }

    if (form.price === '' || Number.isNaN(Number(form.price))) {
        errors.price = ['The price field is required.'];
    }

    if (form.stock === '' || Number.isNaN(Number(form.stock))) {
        errors.stock = ['The stock field is required.'];
    }

    return errors;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPageTitle('Add Product');
    }, [setPageTitle]);

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
            await createProduct(form);
            toast.success('Product created successfully', {
                style: {
                    color: '#16a34a',
                },
            });
            navigate('/admin/products');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create product.';
                setRequestError(message);
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

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/products')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    submitLabel="Create Product"
                    submittingLabel="Creating..."
                />
            </div>
        </div>
    );
}
