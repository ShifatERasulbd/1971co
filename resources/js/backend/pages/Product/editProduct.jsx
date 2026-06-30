import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/products/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCategories } from '@/pages/Category/api';
import { fetchColors } from '@/pages/Color/api';
import { fetchGrandChilds } from '@/pages/GrandChild/api';
import { fetchSizes } from '@/pages/Size/api';
import { fetchSubCategories } from '@/pages/SubCategory/api';

import { fetchProduct, updateProduct } from './api';

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

function pickVariantNumberValue(existingValue, fallbackValue) {
    if (existingValue === '' || existingValue === null || existingValue === undefined) {
        return fallbackValue;
    }

    return existingValue;
}

function buildVariantKey(color, size) {
    return `${String(color || '').trim()}__${String(size || '').trim()}`;
}

function parseSelectionValues(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item ?? '').trim())
            .filter(Boolean);
    }

    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeProductFeatures(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                icon: String(item.icon || 'sparkles').trim() || 'sparkles',
                text: String(item.text || '').trim(),
            }));
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const decoded = JSON.parse(trimmed);
            if (Array.isArray(decoded)) {
                return normalizeProductFeatures(decoded);
            }
        } catch {
            return [];
        }
    }

    return [];
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

export default function EditProduct() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);
    const [newGalleryImageFiles, setNewGalleryImageFiles] = useState([]);
    const [existingProductVideos, setExistingProductVideos] = useState([]);
    const [newProductVideoFiles, setNewProductVideoFiles] = useState([]);
    const [existingSizeChartImages, setExistingSizeChartImages] = useState([]);
    const [newSizeChartImageFiles, setNewSizeChartImageFiles] = useState([]);
    const [colorVariantImageMap, setColorVariantImageMap] = useState({});
    const [colorVariantVideoMap, setColorVariantVideoMap] = useState({});
    const [colorVariantSizeChartMap, setColorVariantSizeChartMap] = useState({});
    const [colorOptions, setColorOptions] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [grandChildOptions, setGrandChildOptions] = useState([]);
    const [isOptionsLoading, setIsOptionsLoading] = useState(true);
    const [colorSelectValue, setColorSelectValue] = useState('');
    const [sizeSelectValue, setSizeSelectValue] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [colorTrendingMap, setColorTrendingMap] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [variantRows, setVariantRows] = useState([]);
    const isGroupEdit = Boolean(location.state?.productGroup?.isGroupEdit && variantRows.length > 0);

    const colorLookup = useMemo(() => {
        const ids = new Set();
        const byName = {};

        colorOptions.forEach((color) => {
            const id = String(color?.id ?? '').trim();
            if (!id) {
                return;
            }

            ids.add(id);
            const nameKey = String(color?.name ?? '').trim().toLowerCase();
            if (nameKey) {
                byName[nameKey] = id;
            }
        });

        return { ids, byName };
    }, [colorOptions]);

    const sizeLookup = useMemo(() => {
        const ids = new Set();
        const byName = {};

        sizeOptions.forEach((size) => {
            const id = String(size?.id ?? '').trim();
            if (!id) {
                return;
            }

            ids.add(id);
            const sizeKey = String(size?.size ?? '').trim().toLowerCase();
            if (sizeKey) {
                byName[sizeKey] = id;
            }
        });

        return { ids, byName };
    }, [sizeOptions]);

    const colorLabelById = useMemo(() => {
        const map = {};
        colorOptions.forEach((color) => {
            const id = String(color?.id ?? '').trim();
            if (!id) {
                return;
            }

            map[id] = String(color?.name || id).trim();
        });
        return map;
    }, [colorOptions]);

    const sizeLabelById = useMemo(() => {
        const map = {};
        sizeOptions.forEach((size) => {
            const id = String(size?.id ?? '').trim();
            if (!id) {
                return;
            }

            map[id] = String(size?.size || id).trim();
        });
        return map;
    }, [sizeOptions]);

    const resolveColorId = useCallback((value) => {
        const token = String(value ?? '').trim();
        if (!token) {
            return '';
        }

        if (colorLookup.ids.has(token)) {
            return token;
        }

        return colorLookup.byName[token.toLowerCase()] || token;
    }, [colorLookup]);

    const resolveSizeId = useCallback((value) => {
        const token = String(value ?? '').trim();
        if (!token) {
            return '';
        }

        if (sizeLookup.ids.has(token)) {
            return token;
        }

        return sizeLookup.byName[token.toLowerCase()] || token;
    }, [sizeLookup]);

    const normalizeIdList = useCallback((values, resolver) => {
        const seen = new Set();

        return values
            .map((item) => resolver(item))
            .map((item) => String(item || '').trim())
            .filter((item) => {
                if (!item || seen.has(item)) {
                    return false;
                }

                seen.add(item);
                return true;
            });
    }, []);

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

    const sizeChartPreviewItems = useMemo(() => {
        const existing = existingSizeChartImages.map((url, index) => {
            const chunks = String(url).split('/');
            const filename = chunks[chunks.length - 1] || `size-chart-${index + 1}`;

            return {
                id: `existing-size-chart-${index}-${url}`,
                name: filename,
                value: url,
                url,
                source: 'existing',
            };
        });

        const fresh = newSizeChartImageFiles.map((file) => ({
            id: `new-size-chart-${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
            source: 'new',
        }));

        return [...existing, ...fresh];
    }, [existingSizeChartImages, newSizeChartImageFiles]);

    const productVideoPreviewItems = useMemo(() => {
        const existing = existingProductVideos.map((url, index) => {
            const chunks = String(url).split('/');
            const filename = chunks[chunks.length - 1] || `video-${index + 1}`;

            return {
                id: `existing-video-${index}-${url}`,
                name: filename,
                value: url,
                url,
                source: 'existing',
            };
        });

        const fresh = newProductVideoFiles.map((file) => ({
            id: `new-video-${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            value: file.name,
            url: URL.createObjectURL(file),
            source: 'new',
        }));

        return [...existing, ...fresh];
    }, [existingProductVideos, newProductVideoFiles]);

    useEffect(() => {
        setPageTitle('Edit Product');
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
            galleryPreviewItems.forEach((item) => {
                if (item.source === 'new') {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [galleryPreviewItems]);

    useEffect(() => {
        return () => {
            sizeChartPreviewItems.forEach((item) => {
                if (item.source === 'new') {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [sizeChartPreviewItems]);

    useEffect(() => {
        return () => {
            productVideoPreviewItems.forEach((item) => {
                if (item.source === 'new') {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [productVideoPreviewItems]);

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
                        id: variant?.id,
                        key: buildVariantKey(variant?.color || '', variant?.size || '') || `variant-${index}`,
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
                        slug: data?.slug || '',
                        sku: data?.sku || '',
                        color: data?.color || '',
                        size: data?.size || '',
                        description: data?.description || '',
                        fit: data?.fit || data?.long_description || '',
                        fabric_and_care: data?.fabric_and_care || data?.additional_information || '',
                        product_features: normalizeProductFeatures(data?.product_features),
                        product_composition: data?.product_composition || '',
                        long_description: data?.long_description || '',
                        additional_information: data?.additional_information || '',
                        price: data?.price ?? '',
                        cover_image: data?.cover_image || '',
                        size_chart_image: data?.size_chart_image || '',
                        category_id: data?.category_id ?? '',
                        subcategory_id: data?.subcategory_id ?? '',
                        grand_child_id: data?.grand_child_id ?? '',
                        stock: data?.stock ?? '',
                        show_on_best_sellers: Boolean(data?.show_on_best_sellers),
                    });

                    setExistingGalleryUrls(Array.isArray(data?.image_gallery) ? data.image_gallery : []);
                    setExistingProductVideos(Array.isArray(data?.product_videos) ? data.product_videos : []);
                    setExistingSizeChartImages(
                        Array.isArray(data?.size_chart_images)
                            ? data.size_chart_images
                            : (data?.size_chart_image ? [data.size_chart_image] : []),
                    );
                    setColorVariantImageMap(
                        data?.color_variant_images && typeof data.color_variant_images === 'object'
                            ? data.color_variant_images
                            : {},
                    );
                    setColorVariantVideoMap(
                        data?.color_variant_videos && typeof data.color_variant_videos === 'object'
                            ? data.color_variant_videos
                            : {},
                    );
                    setColorVariantSizeChartMap(
                        data?.color_variant_size_charts && typeof data.color_variant_size_charts === 'object'
                            ? data.color_variant_size_charts
                            : {},
                    );

                    if (backendVariants.length > 0) {
                        const nextRows = backendVariants.map((row, index) => ({
                            id: row?.id,
                            key: row?.key || buildVariantKey(row?.color || '', row?.size || '') || `variant-${index}`,
                            sku: row?.sku || '',
                            color: String(row?.color || '').trim(),
                            size: String(row?.size || '').trim(),
                            stock: row?.stock ?? '',
                            price: row?.price ?? '',
                            show_on_best_sellers: Boolean(row?.show_on_best_sellers),
                        }));

                        const nextTrendingMap = {};
                        nextRows.forEach((row) => {
                            const colorKey = String(row.color || '').trim();
                            if (!colorKey) {
                                return;
                            }

                            if (!Object.prototype.hasOwnProperty.call(nextTrendingMap, colorKey)) {
                                nextTrendingMap[colorKey] = false;
                            }

                            if (row.show_on_best_sellers === true) {
                                nextTrendingMap[colorKey] = true;
                            }
                        });

                        setVariantRows(nextRows);
                        setColorTrendingMap(nextTrendingMap);
                        setSelectedColors([...new Set(nextRows.map((row) => row.color).filter(Boolean))]);
                        setSelectedSizes([...new Set(nextRows.map((row) => row.size).filter(Boolean))]);
                    } else if (fallbackVariants.length > 0) {
                        const nextRows = fallbackVariants.map((row) => ({
                            ...row,
                            show_on_best_sellers: Boolean(row?.show_on_best_sellers),
                        }));

                        const nextTrendingMap = {};
                        nextRows.forEach((row) => {
                            const colorKey = String(row.color || '').trim();
                            if (!colorKey) {
                                return;
                            }

                            if (!Object.prototype.hasOwnProperty.call(nextTrendingMap, colorKey)) {
                                nextTrendingMap[colorKey] = false;
                            }

                            if (row.show_on_best_sellers === true) {
                                nextTrendingMap[colorKey] = true;
                            }
                        });

                        setColorTrendingMap(nextTrendingMap);
                        setVariantRows(nextRows);
                        setSelectedColors([...new Set(nextRows.map((row) => row.color).filter(Boolean))]);
                        setSelectedSizes([...new Set(nextRows.map((row) => row.size).filter(Boolean))]);
                    } else {
                        const fallbackColorValues = parseSelectionValues(data?.color);
                        const fallbackSizeValues = parseSelectionValues(data?.size);

                        const singleRow = {
                            key: buildVariantKey(data?.color || '', data?.size || '') || `${data?.color || 'color'}__${data?.size || 'size'}__0`,
                            sku: data?.sku || '',
                            color: data?.color || '',
                            size: data?.size || '',
                            stock: data?.stock ?? '',
                            price: data?.price ?? '',
                            show_on_best_sellers: Boolean(data?.show_on_best_sellers),
                        };

                        setVariantRows([singleRow]);
                        setColorTrendingMap(
                            singleRow.color
                                ? { [String(singleRow.color).trim()]: Boolean(singleRow.show_on_best_sellers) }
                                : {},
                        );
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
        if (colorOptions.length === 0 && sizeOptions.length === 0) {
            return;
        }

        setSelectedColors((previous) => normalizeIdList(previous, resolveColorId));
        setSelectedSizes((previous) => normalizeIdList(previous, resolveSizeId));

        setVariantRows((previous) =>
            previous.map((row, index) => {
                const color = resolveColorId(row?.color);
                const size = resolveSizeId(row?.size);

                return {
                    ...row,
                    color,
                    size,
                    key: row?.key || buildVariantKey(color, size) || `variant-${index}`,
                };
            }),
        );

        setColorVariantImageMap((previous) => {
            const next = {};

            Object.entries(previous || {}).forEach(([colorKey, values]) => {
                const colorId = resolveColorId(colorKey);
                if (!colorId) {
                    return;
                }

                next[colorId] = Array.isArray(values) ? values : [];
            });

            return next;
        });

        setColorVariantVideoMap((previous) => {
            const next = {};

            Object.entries(previous || {}).forEach(([colorKey, values]) => {
                const colorId = resolveColorId(colorKey);
                if (!colorId) {
                    return;
                }

                next[colorId] = Array.isArray(values) ? values : [];
            });

            return next;
        });

        setColorVariantSizeChartMap((previous) => {
            const next = {};

            Object.entries(previous || {}).forEach(([colorKey, values]) => {
                const colorId = resolveColorId(colorKey);
                if (!colorId) {
                    return;
                }

                next[colorId] = Array.isArray(values) ? values : [];
            });

            return next;
        });

        setColorTrendingMap((previous) => {
            const next = {};

            Object.entries(previous || {}).forEach(([colorKey, isTrending]) => {
                const colorId = resolveColorId(colorKey);
                if (!colorId) {
                    return;
                }

                next[colorId] = Boolean(isTrending);
            });

            return next;
        });

        setForm((previous) => ({
            ...previous,
            color: normalizeIdList(parseSelectionValues(previous.color), resolveColorId).join(', '),
            size: normalizeIdList(parseSelectionValues(previous.size), resolveSizeId).join(', '),
        }));
    }, [
        colorOptions,
        sizeOptions,
        resolveColorId,
        resolveSizeId,
        normalizeIdList,
    ]);

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
                    const key = buildVariantKey(color, size);
                    const existing = previousByKey[key];
                    const colorSkuToken = colorLabelById[String(color)] || color;
                    const sizeSkuToken = sizeLabelById[String(size)] || size;
                    const defaultSkuSuffix = `${colorSkuToken}-${sizeSkuToken}`.toUpperCase().replace(/\s+/g, '-');

                    next.push({
                        key,
                        id: existing?.id,
                        color,
                        size,
                        sku: existing?.sku || (form.sku ? `${form.sku}-${defaultSkuSuffix}` : ''),
                        stock: pickVariantNumberValue(existing?.stock, form.stock),
                        price: pickVariantNumberValue(existing?.price, form.price),
                        show_on_best_sellers: Boolean(existing?.show_on_best_sellers ?? colorTrendingMap[color]),
                    });
                });
            });

            return next;
        });
    }, [selectedColors, selectedSizes, form.sku, form.stock, form.price, isGroupEdit, colorLabelById, sizeLabelById, colorTrendingMap]);

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

    useEffect(() => {
        const validValues = new Set(productVideoPreviewItems.map((item) => item.value));

        setColorVariantVideoMap((previous) => {
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
    }, [productVideoPreviewItems]);

    useEffect(() => {
        const validValues = new Set(sizeChartPreviewItems.map((item) => item.value));

        setColorVariantSizeChartMap((previous) => {
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
    }, [sizeChartPreviewItems]);

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
        setColorTrendingMap((previous) => {
            if (!Object.prototype.hasOwnProperty.call(previous, colorToRemove)) {
                return previous;
            }

            const next = { ...previous };
            delete next[colorToRemove];
            return next;
        });
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

    const handleProductVideosChange = (event) => {
        const files = Array.from(event.target.files || []);
        setNewProductVideoFiles(files.filter((file) => file instanceof File));
        setErrors((previous) => {
            if (!previous.product_videos) return previous;
            const next = { ...previous };
            delete next.product_videos;
            return next;
        });
    };

    const handleRemoveExistingProductVideo = (indexToRemove) => {
        setExistingProductVideos((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewProductVideo = (indexToRemove) => {
        setNewProductVideoFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleReorderGalleryItems = (fromItem, toItem) => {
        const fromIndex = Number(fromItem?.index);
        const toIndex = Number(toItem?.index);

        if (
            !fromItem
            || !toItem
            || fromItem.source !== toItem.source
            || Number.isNaN(fromIndex)
            || Number.isNaN(toIndex)
            || fromIndex === toIndex
        ) {
            return;
        }

        if (fromItem.source === 'existing') {
            setExistingGalleryUrls((previous) => reorderItems(previous, fromIndex, toIndex));
            return;
        }

        if (fromItem.source === 'new') {
            setNewGalleryImageFiles((previous) => reorderItems(previous, fromIndex, toIndex));
        }
    };

    const handleSizeChartImageChange = (event) => {
        const files = Array.from(event.target.files || []).filter((file) => file instanceof File);
        setNewSizeChartImageFiles(files);
        setErrors((previous) => {
            if (!previous.size_chart_files) return previous;
            const next = { ...previous };
            delete next.size_chart_files;
            return next;
        });
    };

    const handleRemoveExistingSizeChartImage = (indexToRemove) => {
        setExistingSizeChartImages((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewSizeChartImage = (indexToRemove) => {
        setNewSizeChartImageFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveSizeChartImage = (item) => {
        if (item?.source === 'existing') {
            handleRemoveExistingSizeChartImage(item.index);
            return;
        }

        handleRemoveNewSizeChartImage(item?.index ?? -1);
        setForm((previous) => ({
            ...previous,
            size_chart_image: '',
        }));
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

    const handleColorVariantVideosChange = (color, selectedValues) => {
        setColorVariantVideoMap((previous) => {
            const next = { ...(previous || {}) };
            if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedValues;
            return next;
        });
    };

    const handleColorVariantSizeChartsChange = (color, selectedValues) => {
        setColorVariantSizeChartMap((previous) => {
            const next = { ...(previous || {}) };
            if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
                delete next[color];
                return next;
            }
            next[color] = selectedValues;
            return next;
        });
    };

    const handleColorTrendingChange = (color, checked) => {
        const normalizedColor = String(color || '').trim();
        if (!normalizedColor) {
            return;
        }

        setColorTrendingMap((previous) => ({
            ...previous,
            [normalizedColor]: Boolean(checked),
        }));

        setVariantRows((previous) =>
            previous.map((row) => (
                String(row.color || '').trim() === normalizedColor
                    ? { ...row, show_on_best_sellers: Boolean(checked) }
                    : row
            )),
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

            await updateProduct(id, {
                ...form,
                long_description: form.fit,
                additional_information: form.fabric_and_care,
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
                color_variant_videos: colorVariantVideoMap,
                color_variant_size_charts: colorVariantSizeChartMap,
                galleryImageFiles: newGalleryImageFiles,
                image_gallery_existing: existingGalleryUrls,
                clear_gallery: existingGalleryUrls.length === 0 && newGalleryImageFiles.length === 0,
                productVideoFiles: newProductVideoFiles,
                product_videos_existing: existingProductVideos,
                clear_videos: existingProductVideos.length === 0 && newProductVideoFiles.length === 0,
                sizeChartImageFiles: newSizeChartImageFiles,
                size_chart_images_existing: existingSizeChartImages,
                clear_size_charts: existingSizeChartImages.length === 0 && newSizeChartImageFiles.length === 0,
            });

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
                    categoryOptions={categoryOptions}
                    subCategoryOptions={filteredSubCategoryOptions}
                    grandChildOptions={filteredGrandChildOptions}
                    isOptionsLoading={isOptionsLoading}
                    colorSelectValue={colorSelectValue}
                    sizeSelectValue={sizeSelectValue}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    colorTrendingMap={colorTrendingMap}
                    variantRows={variantRows}
                    colorVariantImageMap={colorVariantImageMap}
                    colorVariantVideoMap={colorVariantVideoMap}
                    colorVariantSizeChartMap={colorVariantSizeChartMap}
                    galleryPreviewItems={galleryPreviewItems}
                    variantGroupName={location.state?.productGroup?.groupName || form.name || ''}
                    onColorSelectChange={setColorSelectValue}
                    onSizeSelectChange={setSizeSelectValue}
                    onAddColor={handleAddColor}
                    onRemoveColor={handleRemoveColor}
                    onReorderColors={handleReorderColors}
                    onAddSize={handleAddSize}
                    onRemoveSize={handleRemoveSize}
                    onVariantRowChange={handleVariantRowChange}
                    onColorTrendingChange={handleColorTrendingChange}
                    onColorVariantImagesChange={handleColorVariantImagesChange}
                    onColorVariantVideosChange={handleColorVariantVideosChange}
                    onColorVariantSizeChartsChange={handleColorVariantSizeChartsChange}
                    onGalleryFilesChange={handleGalleryFilesChange}
                    onRemoveExistingGalleryImage={handleRemoveExistingGalleryImage}
                    onRemoveNewGalleryImage={handleRemoveNewGalleryImage}
                    onReorderGalleryItems={handleReorderGalleryItems}
                    onProductVideosChange={handleProductVideosChange}
                    onRemoveExistingProductVideo={handleRemoveExistingProductVideo}
                    onRemoveNewProductVideo={handleRemoveNewProductVideo}
                    productVideoPreviewItems={productVideoPreviewItems}
                    onSizeChartImageChange={handleSizeChartImageChange}
                    onRemoveSizeChartImage={handleRemoveSizeChartImage}
                    sizeChartPreviewItems={sizeChartPreviewItems}
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
