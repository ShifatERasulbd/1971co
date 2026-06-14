import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/products/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchColors } from '@/pages/Color/api';
import { fetchSizes } from '@/pages/Size/api';

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
    show_on_best_sellers: false,
};

function pickVariantNumberValue(existingValue, fallbackValue) {
    if (existingValue === '' || existingValue === null || existingValue === undefined) {
        return fallbackValue;
    }

    return existingValue;
}

export default function EditProduct() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);
    const [newGalleryImageFiles, setNewGalleryImageFiles] = useState([]);
    const [colorVariantImageMap, setColorVariantImageMap] = useState({});
    const [colorOptions, setColorOptions] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);
    const [isOptionsLoading, setIsOptionsLoading] = useState(true);
    const [colorSelectValue, setColorSelectValue] = useState('');
    const [sizeSelectValue, setSizeSelectValue] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [variantRows, setVariantRows] = useState([]);
    const isGroupEdit = Boolean(location.state?.productGroup?.isGroupEdit && variantRows.length > 0);

    const galleryPreviewItems = useMemo(() => {
        const existing = existingGalleryUrls.map((url, index) => {
            const chunks = String(url).split('/');
            const filename = chunks[chunks.length - 1] || `image-${index + 1}`;

            return {
                id: `existing-${index}-${url}`,
                name: filename,
                value: url,
                url,
                source: 'existing',
            };
        });

        const fresh = newGalleryImageFiles.map((file) => ({
            id: `new-${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
            source: 'new',
        }));

        return [...existing, ...fresh];
    }, [existingGalleryUrls, newGalleryImageFiles]);

    useEffect(() => {
        setPageTitle('Edit Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            setIsOptionsLoading(true);

            try {
                const [colors, sizes] = await Promise.all([fetchColors(), fetchSizes()]);
                if (!ignore) {
                    setColorOptions(Array.isArray(colors) ? colors : []);
                    setSizeOptions(Array.isArray(sizes) ? sizes : []);
                }
            } catch {
                if (!ignore) {
                    setColorOptions([]);
                    setSizeOptions([]);
                }
            } finally {
                if (!ignore) {
                    setIsOptionsLoading(false);
                }
            }
        }

        loadOptions();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            galleryPreviewItems.forEach((item) => {
                if (item.source === 'new') {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [galleryPreviewItems]);

    useEffect(() => {
        let ignore = false;

        async function loadProduct() {
            setIsLoading(true);
            setLoadError('');

            try {
                const data = await fetchProduct(id);
                if (!ignore) {
                    const backendVariants = Array.isArray(data?.variant_rows) ? data.variant_rows : [];
                    const fallbackVariants = (location.state?.productGroup?.variants || []).map((variant, index) => ({
                        key: variant?.id ? `variant-${variant.id}` : `variant-${index}`,
                        sku: variant?.sku || '',
                        color: Array.isArray(variant?.color)
                            ? variant.color.filter(Boolean).join(', ')
                            : (variant?.color || ''),
                        size: variant?.size || '',
                        stock: variant?.stock ?? 0,
                        price: variant?.price ?? 0,
                    }));

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
                        show_on_best_sellers: Boolean(data?.show_on_best_sellers),
                    });

                    setExistingGalleryUrls(Array.isArray(data?.image_gallery) ? data.image_gallery : []);
                    setColorVariantImageMap(
                        data?.color_variant_images && typeof data.color_variant_images === 'object'
                            ? data.color_variant_images
                            : {},
                    );

                    if (backendVariants.length > 0) {
                        const nextRows = backendVariants.map((row, index) => ({
                                key: row?.key || `${row?.color || 'color'}__${row?.size || 'size'}__${index}`,
                                sku: row?.sku || '',
                                color: row?.color || '',
                                size: row?.size || '',
                                stock: row?.stock ?? '',
                                price: row?.price ?? '',
                            }));

                        setVariantRows(nextRows);
                        setSelectedColors([...new Set(nextRows.map((row) => row.color).filter(Boolean))]);
                        setSelectedSizes([...new Set(nextRows.map((row) => row.size).filter(Boolean))]);
                    } else if (fallbackVariants.length > 0) {
                        setVariantRows(fallbackVariants);
                        setSelectedColors([...new Set(fallbackVariants.map((row) => row.color).filter(Boolean))]);
                        setSelectedSizes([...new Set(fallbackVariants.map((row) => row.size).filter(Boolean))]);
                    } else {
                        const fallbackColorValues = String(data?.color || '')
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean);
                        const fallbackSizeValues = String(data?.size || '')
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean);

                        const singleRow = {
                                key: `${data?.color || 'color'}__${data?.size || 'size'}__0`,
                                sku: data?.sku || '',
                                color: data?.color || '',
                                size: data?.size || '',
                                stock: data?.stock ?? '',
                                price: data?.price ?? '',
                            };

                        setVariantRows([singleRow]);
                        setSelectedColors(
                            fallbackColorValues.length > 0
                                ? fallbackColorValues
                                : (singleRow.color ? [singleRow.color] : []),
                        );
                        setSelectedSizes(
                            fallbackSizeValues.length > 0
                                ? fallbackSizeValues
                                : (singleRow.size ? [singleRow.size] : []),
                        );
                    }
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

    useEffect(() => {
        if (isGroupEdit) {
            return;
        }

        if (selectedColors.length === 0 || selectedSizes.length === 0) {
            setVariantRows([]);
            return;
        }

        setVariantRows((previous) => {
            const previousByKey = Object.fromEntries(previous.map((row) => [row.key, row]));
            const next = [];

            selectedColors.forEach((color) => {
                selectedSizes.forEach((size) => {
                    const key = `${color}__${size}`;
                    const existing = previousByKey[key];
                    const defaultSkuSuffix = `${color}-${size}`.toUpperCase().replace(/\s+/g, '-');

                    next.push({
                        key,
                        color,
                        size,
                        sku: existing?.sku || (form.sku ? `${form.sku}-${defaultSkuSuffix}` : ''),
                        stock: pickVariantNumberValue(existing?.stock, form.stock),
                        price: pickVariantNumberValue(existing?.price, form.price),
                    });
                });
            });

            return next;
        });
    }, [selectedColors, selectedSizes, form.sku, form.stock, form.price, isGroupEdit]);

    useEffect(() => {
        const validValues = new Set(galleryPreviewItems.map((item) => item.value));

        setColorVariantImageMap((previous) => {
            let changed = false;
            const next = {};

            Object.entries(previous || {}).forEach(([color, values]) => {
                const filtered = (Array.isArray(values) ? values : []).filter((value) => validValues.has(value));
                if (filtered.length > 0) {
                    next[color] = filtered;
                }
                if (filtered.length !== (Array.isArray(values) ? values.length : 0)) {
                    changed = true;
                }
            });

            return changed ? next : previous;
        });
    }, [galleryPreviewItems]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;
        setForm((previous) => ({ ...previous, [name]: nextValue }));
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleVariantRowChange = (rowKey, field, value) => {
        setVariantRows((previous) =>
            previous.map((row) => (row.key === rowKey ? { ...row, [field]: value } : row)),
        );
    };

    const handleAddColor = () => {
        if (!colorSelectValue) {
            return;
        }

        setSelectedColors((previous) => (previous.includes(colorSelectValue) ? previous : [...previous, colorSelectValue]));
        setColorSelectValue('');
    };

    const handleRemoveColor = (colorToRemove) => {
        setSelectedColors((previous) => previous.filter((color) => color !== colorToRemove));
        setColorVariantImageMap((previous) => {
            if (!previous[colorToRemove]) {
                return previous;
            }

            const next = { ...previous };
            delete next[colorToRemove];
            return next;
        });
    };

    const handleAddSize = () => {
        if (!sizeSelectValue) {
            return;
        }

        setSelectedSizes((previous) => (previous.includes(sizeSelectValue) ? previous : [...previous, sizeSelectValue]));
        setSizeSelectValue('');
    };

    const handleRemoveSize = (sizeToRemove) => {
        setSelectedSizes((previous) => previous.filter((size) => size !== sizeToRemove));
    };

    const handleGalleryFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        setNewGalleryImageFiles(files);
    };

    const handleRemoveExistingGalleryImage = (indexToRemove) => {
        setExistingGalleryUrls((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewGalleryImage = (indexToRemove) => {
        setNewGalleryImageFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleColorVariantImagesChange = (color, selectedValues) => {
        setColorVariantImageMap((previous) => {
            const next = { ...(previous || {}) };
            if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedValues;
            return next;
        });
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
                        updateProduct(row.id || id, {
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
                await updateProduct(id, {
                    ...form,
                    color:
                        variantRows.length > 0
                            ? [...new Set(variantRows.map((row) => row.color).filter(Boolean))].join(', ')
                            : form.color,
                    size:
                        variantRows.length > 0
                            ? [...new Set(variantRows.map((row) => row.size).filter(Boolean))].join(', ')
                            : form.size,
                    variant_rows: variantRows,
                    color_variant_images: colorVariantImageMap,
                    galleryImageFiles: newGalleryImageFiles,
                    image_gallery_existing: existingGalleryUrls,
                    clear_gallery: existingGalleryUrls.length === 0 && newGalleryImageFiles.length === 0,
                });
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
                    colorOptions={colorOptions}
                    sizeOptions={sizeOptions}
                    isOptionsLoading={isOptionsLoading}
                    colorSelectValue={colorSelectValue}
                    sizeSelectValue={sizeSelectValue}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    variantRows={variantRows}
                    colorVariantImageMap={colorVariantImageMap}
                    galleryPreviewItems={galleryPreviewItems}
                    variantGroupName={location.state?.productGroup?.groupName || form.name || ''}
                    onColorSelectChange={setColorSelectValue}
                    onSizeSelectChange={setSizeSelectValue}
                    onAddColor={handleAddColor}
                    onRemoveColor={handleRemoveColor}
                    onAddSize={handleAddSize}
                    onRemoveSize={handleRemoveSize}
                    onVariantRowChange={handleVariantRowChange}
                    onColorVariantImagesChange={handleColorVariantImagesChange}
                    onGalleryFilesChange={handleGalleryFilesChange}
                    onRemoveExistingGalleryImage={handleRemoveExistingGalleryImage}
                    onRemoveNewGalleryImage={handleRemoveNewGalleryImage}
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
