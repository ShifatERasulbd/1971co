import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/products/addForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCategories } from '@/pages/Category/api';
import { fetchColors } from '@/pages/Color/api';
import { fetchGrandChilds } from '@/pages/GrandChild/api';
import { fetchSizes } from '@/pages/Size/api';
import { fetchSubCategories } from '@/pages/SubCategory/api';

import { createProduct } from './api';

const initialForm = {
    name: '',
    slug: '',
    sku: '',
    color: '',
    size: '',
    description: '',
    fit: '',
    fabric_and_care: '',
    product_features: [],
    product_composition: '',
    long_description: '',
    additional_information: '',
    price: '',
    cover_image: '',
    size_chart_image: '',
    category_id: '',
    subcategory_id: '',
    grand_child_id: '',
    stock: '',
    show_on_best_sellers: false,
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

function pickVariantNumberValue(existingValue, fallbackValue) {
    if (existingValue === '' || existingValue === null || existingValue === undefined) {
        return fallbackValue;
    }

    return existingValue;
}

function reorderItems(items, fromIndex, toIndex) {
    if (
        !Array.isArray(items)
        || fromIndex < 0
        || toIndex < 0
        || fromIndex >= items.length
        || toIndex >= items.length
        || fromIndex === toIndex
    ) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [productVideoFiles, setProductVideoFiles] = useState([]);
    const [sizeChartImageFiles, setSizeChartImageFiles] = useState([]);
    const [colorSelectValue, setColorSelectValue] = useState('');
    const [sizeSelectValue, setSizeSelectValue] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [variantRows, setVariantRows] = useState([]);
    const [colorVariantImageMap, setColorVariantImageMap] = useState({});
    const [colorVariantVideoMap, setColorVariantVideoMap] = useState({});
    const [colorVariantSizeChartMap, setColorVariantSizeChartMap] = useState({});
    const [colorOptions, setColorOptions] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [grandChildOptions, setGrandChildOptions] = useState([]);
    const [isOptionsLoading, setIsOptionsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const galleryPreviewUrls = useMemo(
        () => galleryImageFiles.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
        })),
        [galleryImageFiles],
    );

    const sizeChartPreviewItems = useMemo(
        () => sizeChartImageFiles.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
        })),
        [sizeChartImageFiles],
    );

    const productVideoPreviewItems = useMemo(
        () => productVideoFiles.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
        })),
        [productVideoFiles],
    );

    useEffect(() => {
        setPageTitle('Add Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            setIsOptionsLoading(true);

            try {
                const [colors, sizes, categories, subCategories, grandChilds] = await Promise.all([
                    fetchColors(),
                    fetchSizes(),
                    fetchCategories(),
                    fetchSubCategories(),
                    fetchGrandChilds(),
                ]);
                if (!ignore) {
                    setColorOptions(Array.isArray(colors) ? colors : []);
                    setSizeOptions(Array.isArray(sizes) ? sizes : []);
                    setCategoryOptions(Array.isArray(categories) ? categories : []);
                    setSubCategoryOptions(Array.isArray(subCategories) ? subCategories : []);
                    setGrandChildOptions(Array.isArray(grandChilds) ? grandChilds : []);
                }
            } catch {
                if (!ignore) {
                    setColorOptions([]);
                    setSizeOptions([]);
                    setCategoryOptions([]);
                    setSubCategoryOptions([]);
                    setGrandChildOptions([]);
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
            galleryPreviewUrls.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, [galleryPreviewUrls]);

    useEffect(() => {
        return () => {
            sizeChartPreviewItems.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, [sizeChartPreviewItems]);
    useEffect(() => {
        const validSizeChartValues = new Set(sizeChartPreviewItems.map((item) => item.value));

        setColorVariantSizeChartMap((previous) => {
            let changed = false;
            const next = {};

            Object.entries(previous).forEach(([color, values]) => {
                const filtered = (Array.isArray(values) ? values : []).filter((value) => validSizeChartValues.has(value));
                if (filtered.length > 0) {
                    next[color] = filtered;
                }

                if (filtered.length !== (Array.isArray(values) ? values.length : 0)) {
                    changed = true;
                }
            });

            return changed ? next : previous;
        });
    }, [sizeChartPreviewItems]);

    useEffect(() => {
        return () => {
            productVideoPreviewItems.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, [productVideoPreviewItems]);

    useEffect(() => {
        const validImageValues = new Set(galleryPreviewUrls.map((item) => item.value));

        setColorVariantImageMap((previous) => {
            let changed = false;
            const next = {};

            Object.entries(previous).forEach(([color, imageValues]) => {
                const filtered = (Array.isArray(imageValues) ? imageValues : []).filter((value) => validImageValues.has(value));
                if (filtered.length > 0) {
                    next[color] = filtered;
                }

                if (filtered.length !== (Array.isArray(imageValues) ? imageValues.length : 0)) {
                    changed = true;
                }
            });

            return changed ? next : previous;
        });
    }, [galleryPreviewUrls]);

    useEffect(() => {
        const validVideoValues = new Set(productVideoPreviewItems.map((item) => item.value));

        setColorVariantVideoMap((previous) => {
            let changed = false;
            const next = {};

            Object.entries(previous).forEach(([color, videoValues]) => {
                const filtered = (Array.isArray(videoValues) ? videoValues : []).filter((value) => validVideoValues.has(value));
                if (filtered.length > 0) {
                    next[color] = filtered;
                }

                if (filtered.length !== (Array.isArray(videoValues) ? videoValues.length : 0)) {
                    changed = true;
                }
            });

            return changed ? next : previous;
        });
    }, [productVideoPreviewItems]);

    useEffect(() => {
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
    }, [selectedColors, selectedSizes, form.sku, form.stock, form.price]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;
        setForm((previous) => {
            const next = { ...previous, [name]: nextValue };

            if (name === 'category_id') {
                next.subcategory_id = '';
                next.grand_child_id = '';
            }

            if (name === 'subcategory_id') {
                next.grand_child_id = '';
            }

            return next;
        });
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const filteredSubCategoryOptions = useMemo(() => {
        if (!form.category_id) {
            return subCategoryOptions;
        }

        return subCategoryOptions.filter(
            (item) => String(item.category_id ?? '') === String(form.category_id),
        );
    }, [subCategoryOptions, form.category_id]);

    const filteredGrandChildOptions = useMemo(() => {
        if (form.subcategory_id) {
            return grandChildOptions.filter(
                (item) => String(item.child_id ?? item.sub_category_id ?? '') === String(form.subcategory_id),
            );
        }

        if (form.category_id) {
            return grandChildOptions.filter(
                (item) => String(item.category_id ?? '') === String(form.category_id),
            );
        }

        return grandChildOptions;
    }, [grandChildOptions, form.subcategory_id, form.category_id]);

    const handleGalleryFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        setGalleryImageFiles(files);
        setErrors((previous) => {
            if (!previous.image_gallery) return previous;
            const next = { ...previous };
            delete next.image_gallery;
            return next;
        });
    };

    const handleRemoveGalleryImage = (indexToRemove) => {
        setGalleryImageFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleReorderGalleryImages = (fromIndex, toIndex) => {
        setGalleryImageFiles((previous) => reorderItems(previous, fromIndex, toIndex));
    };

    const handleProductVideosChange = (event) => {
        const files = Array.from(event.target.files || []);
        setProductVideoFiles(files.filter((file) => file instanceof File));
        setErrors((previous) => {
            if (!previous.product_videos) return previous;
            const next = { ...previous };
            delete next.product_videos;
            return next;
        });
    };

    const handleRemoveProductVideo = (indexToRemove) => {
        setProductVideoFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleSizeChartImageChange = (event) => {
        const files = Array.from(event.target.files || []).filter((file) => file instanceof File);
        setSizeChartImageFiles(files);
        setErrors((previous) => {
            if (!previous.size_chart_files) return previous;
            const next = { ...previous };
            delete next.size_chart_files;
            return next;
        });
    };

    const handleRemoveSizeChartImage = (indexToRemove) => {
        setSizeChartImageFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };
    const handleColorVariantSizeChartsChange = (color, selectedSizeChartIds) => {
        setColorVariantSizeChartMap((previous) => {
            const next = { ...previous };
            if (!Array.isArray(selectedSizeChartIds) || selectedSizeChartIds.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedSizeChartIds;
            return next;
        });
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
        setColorVariantVideoMap((previous) => {
            if (!previous[colorToRemove]) {
                return previous;
            }

            const next = { ...previous };
            delete next[colorToRemove];
            return next;
        });
        setColorVariantSizeChartMap((previous) => {
            if (!previous[colorToRemove]) {
                return previous;
            }

            const next = { ...previous };
            delete next[colorToRemove];
            return next;
        });
    };

    const handleReorderColors = (fromColor, toColor) => {
        if (!fromColor || !toColor || fromColor === toColor) {
            return;
        }

        setSelectedColors((previous) => {
            const fromIndex = previous.indexOf(fromColor);
            const toIndex = previous.indexOf(toColor);
            return reorderItems(previous, fromIndex, toIndex);
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

    const handleVariantRowChange = (rowKey, field, value) => {
        setVariantRows((previous) =>
            previous.map((row) => (row.key === rowKey ? { ...row, [field]: value } : row)),
        );
    };

    const handleColorVariantImagesChange = (color, selectedImageIds) => {
        setColorVariantImageMap((previous) => {
            const next = { ...previous };
            if (!Array.isArray(selectedImageIds) || selectedImageIds.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedImageIds;
            return next;
        });
    };

    const handleColorVariantVideosChange = (color, selectedVideoIds) => {
        setColorVariantVideoMap((previous) => {
            const next = { ...previous };
            if (!Array.isArray(selectedVideoIds) || selectedVideoIds.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedVideoIds;
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
            await createProduct({
                ...form,
                long_description: form.fit,
                additional_information: form.fabric_and_care,
                color: selectedColors.length > 0 ? selectedColors.join(', ') : form.color,
                size: selectedSizes.length > 0 ? selectedSizes.join(', ') : form.size,
                variant_rows: variantRows,
                color_variant_images: colorVariantImageMap,
                color_variant_videos: colorVariantVideoMap,
                color_variant_size_charts: colorVariantSizeChartMap,
                galleryImageFiles,
                productVideoFiles,
                sizeChartImageFiles,
                clear_size_charts: sizeChartImageFiles.length === 0,
            });
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
                    colorOptions={colorOptions}
                    sizeOptions={sizeOptions}
                    categoryOptions={categoryOptions}
                    subCategoryOptions={filteredSubCategoryOptions}
                    grandChildOptions={filteredGrandChildOptions}
                    isOptionsLoading={isOptionsLoading}
                    colorSelectValue={colorSelectValue}
                    sizeSelectValue={sizeSelectValue}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    variantRows={variantRows}
                    colorVariantImageMap={colorVariantImageMap}
                    colorVariantVideoMap={colorVariantVideoMap}
                    onColorSelectChange={setColorSelectValue}
                    onSizeSelectChange={setSizeSelectValue}
                    onAddColor={handleAddColor}
                    onRemoveColor={handleRemoveColor}
                    onReorderColors={handleReorderColors}
                    onAddSize={handleAddSize}
                    onRemoveSize={handleRemoveSize}
                    onVariantRowChange={handleVariantRowChange}
                    onColorVariantImagesChange={handleColorVariantImagesChange}
                    onColorVariantVideosChange={handleColorVariantVideosChange}
                    onGalleryFilesChange={handleGalleryFilesChange}
                    onRemoveGalleryImage={handleRemoveGalleryImage}
                    onReorderGalleryImages={handleReorderGalleryImages}
                    galleryPreviewUrls={galleryPreviewUrls}
                    onProductVideosChange={handleProductVideosChange}
                    onRemoveProductVideo={handleRemoveProductVideo}
                    productVideoPreviewItems={productVideoPreviewItems}
                    onSizeChartImageChange={handleSizeChartImageChange}
                    onRemoveSizeChartImage={handleRemoveSizeChartImage}
                    sizeChartPreviewItems={sizeChartPreviewItems}
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
