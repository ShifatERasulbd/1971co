import { useMemo, useState, useEffect} from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from './richTextEditor';
import ProductFeaturesRepeater from './ProductFeaturesRepeater';

export default function EditForm({
    form = {},
    colorOptions = [],
    sizeOptions = [],
    categoryOptions = [],
    subCategoryOptions = [],
    grandChildOptions = [],
    isOptionsLoading = false,
    colorSelectValue = '',
    sizeSelectValue = '',
    selectedColors = [],
    selectedSizes = [],
    variantRows = [],
    colorVariantImageMap = {},
    colorVariantVideoMap = {},
    colorVariantSizeChartMap = {},
    galleryPreviewItems = [],
    variantGroupName = '',
    errors = {},
    isSubmitting = false,
    onChange,
    onColorSelectChange,
    onSizeSelectChange,
    onAddColor,
    onRemoveColor,
    onReorderColors,
    onAddSize,
    onRemoveSize,
    onVariantRowChange,
    onColorVariantImagesChange,
    onColorVariantVideosChange,
    onColorVariantSizeChartsChange,
    onGalleryFilesChange,
    onRemoveExistingGalleryImage,
    onRemoveNewGalleryImage,
    onReorderGalleryItems,
    onProductVideosChange,
    onRemoveExistingProductVideo,
    onRemoveNewProductVideo,
    onSizeChartImageChange,
    onRemoveSizeChartImage,
    sizeChartPreviewItems = [],
    productVideoPreviewItems = [],
    onSubmit,
    onCancel,
    submitLabel = 'Update Product',
    submittingLabel = 'Updating...',
}) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeColorForImages, setActiveColorForImages] = useState('');
    const [draftImageValues, setDraftImageValues] = useState([]);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [activeColorForVideos, setActiveColorForVideos] = useState('');
    const [draftVideoValues, setDraftVideoValues] = useState([]);
    const [isSizeChartModalOpen, setIsSizeChartModalOpen] = useState(false);
    const [activeColorForSizeCharts, setActiveColorForSizeCharts] = useState('');
    const [draftSizeChartValues, setDraftSizeChartValues] = useState([]);
    const [draggingColor, setDraggingColor] = useState('');
    const [draggingGalleryItem, setDraggingGalleryItem] = useState(null);

    const colorLabelById = useMemo(() => {
        const map = {};
        colorOptions.forEach((color) => {
            const id = String(color?.id ?? '').trim();
            if (!id) {
                return;
            }

            const label = `${color?.name || id}${color?.color_code ? ` (${color.color_code})` : ''}`;
            map[id] = label;
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

            map[id] = size?.size || id;
        });
        return map;
    }, [sizeOptions]);

    const getColorLabel = (value) => colorLabelById[String(value ?? '').trim()] || String(value ?? '').trim();
    const getSizeLabel = (value) => sizeLabelById[String(value ?? '').trim()] || String(value ?? '').trim();

    const firstColorRowKeys = useMemo(() => {
        const seenColors = new Set();
        const firstKeys = {};

        variantRows.forEach((row) => {
            if (!seenColors.has(row.color)) {
                seenColors.add(row.color);
                firstKeys[row.key] = true;
            }
        });

        return firstKeys;
    }, [variantRows]);

    const openColorImagesModal = (color) => {
        setActiveColorForImages(color);
        setDraftImageValues(colorVariantImageMap[color] || []);
        setIsImageModalOpen(true);
    };

    const closeColorImagesModal = () => {
        setIsImageModalOpen(false);
        setActiveColorForImages('');
        setDraftImageValues([]);
    };

    const toggleDraftImage = (value) => {
        setDraftImageValues((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value],
        );
    };

    const saveColorImagesSelection = () => {
        if (activeColorForImages) {
            onColorVariantImagesChange?.(activeColorForImages, draftImageValues);
        }
        closeColorImagesModal();
    };

    const openColorVideosModal = (color) => {
        setActiveColorForVideos(color);
        setDraftVideoValues(colorVariantVideoMap[color] || []);
        setIsVideoModalOpen(true);
    };

    const closeColorVideosModal = () => {
        setIsVideoModalOpen(false);
        setActiveColorForVideos('');
        setDraftVideoValues([]);
    };

    const toggleDraftVideo = (value) => {
        setDraftVideoValues((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value],
        );
    };

    const saveColorVideosSelection = () => {
        if (activeColorForVideos) {
            onColorVariantVideosChange?.(activeColorForVideos, draftVideoValues);
        }
        closeColorVideosModal();
    };

    const openColorSizeChartsModal = (color) => {
        setActiveColorForSizeCharts(color);
        setDraftSizeChartValues(colorVariantSizeChartMap[color] || []);
        setIsSizeChartModalOpen(true);
    };

    const closeColorSizeChartsModal = () => {
        setIsSizeChartModalOpen(false);
        setActiveColorForSizeCharts('');
        setDraftSizeChartValues([]);
    };

    const toggleDraftSizeChart = (value) => {
        setDraftSizeChartValues((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value],
        );
    };

    const saveColorSizeChartsSelection = () => {
        if (activeColorForSizeCharts) {
            onColorVariantSizeChartsChange?.(activeColorForSizeCharts, draftSizeChartValues);
        }
        closeColorSizeChartsModal();
    };

    const handleColorDragStart = (event, color) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', color);
        setDraggingColor(color);
    };

    const handleColorDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleColorDrop = (event, color) => {
        event.preventDefault();
        const draggedColor = event.dataTransfer.getData('text/plain') || draggingColor;
        if (!draggedColor || draggedColor === color) {
            setDraggingColor('');
            return;
        }

        onReorderColors?.(draggedColor, color);
        setDraggingColor('');
    };

    const handleColorDragEnd = () => {
        setDraggingColor('');
    };

    const handleGalleryDragStart = (event, source, index) => {
        const payload = { source, index };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify(payload));
        setDraggingGalleryItem(payload);
    };

    const handleGalleryDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleGalleryDrop = (event, source, index) => {
        event.preventDefault();

        let fromItem = draggingGalleryItem;
        try {
            const raw = event.dataTransfer.getData('text/plain');
            if (raw) {
                fromItem = JSON.parse(raw);
            }
        } catch {
            // Ignore malformed drag payload and use local state fallback.
        }

        const toItem = { source, index };
        onReorderGalleryItems?.(fromItem, toItem);
        setDraggingGalleryItem(null);
    };

    const handleGalleryDragEnd = () => {
        setDraggingGalleryItem(null);
    };

      const slugify = (text = '') =>
        text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    
        useEffect(() => {
            if (!form.name) return;
    
            const slug = slugify(form.name);
    
            onChange({
                target: {
                    name: 'slug',
                    value: slug,
                },
            });
        }, [form.name]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update an existing product record in inventory.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="product-name">
                                        Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-name"
                                        name="name"
                                        value={form.name || ''}
                                        onChange={onChange}
                                        placeholder="e.g. Classic Cotton Tee"
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-slug">
                                        Slug <span className="text-destructive">*</span>
                                    </Label>
                                   <Input
                                        id="product-slug"
                                        name="slug"
                                        value={form.slug || ''}
                                        placeholder="auto-generated"
                                        disabled
                                    />
                                    {errors.slug && <p className="text-xs text-destructive">{errors.slug[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-sku">
                                        SKU <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-sku"
                                        name="sku"
                                        value={form.sku || ''}
                                        onChange={onChange}
                                        placeholder="e.g. TEE-BLK-M-1001"
                                    />
                                    {errors.sku && <p className="text-xs text-destructive">{errors.sku[0]}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-description">Description</Label>
                              

                                <RichTextEditor
                                label="Product Description"
                                value={form.description || ''}
                                onChange={(html) => onChange({ target: { name: 'description', value: html } })}
                                placeholder="Detailed product description with formatting"
                                error={errors.description}
                            />
                                {errors.description && <p className="text-xs text-destructive">{errors.description[0]}</p>}
                            </div>

                            <RichTextEditor
                                label="Fit"
                                value={form.fit || ''}
                                onChange={(html) => onChange({ target: { name: 'fit', value: html } })}
                                placeholder="Describe fit details and sizing notes"
                                error={errors.fit}
                            />

                            <RichTextEditor
                                label="Fabric & Care"
                                value={form.fabric_and_care || ''}
                                onChange={(html) => onChange({ target: { name: 'fabric_and_care', value: html } })}
                                placeholder="Fabric composition and care instructions"
                                error={errors.fabric_and_care}
                            />

                            <ProductFeaturesRepeater
                                value={form.product_features}
                                errors={errors}
                                onChange={onChange}
                                disabled={isSubmitting}
                            />

                             <RichTextEditor
                                label="Product Composition"
                                value={form.product_composition || ''}
                                onChange={(html) => onChange({ target: { name: 'product_composition', value: html } })}
                                placeholder="Detail the materials and composition of the product"
                                error={errors.product_composition}
                            />

                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="product-gallery-upload">Image Gallery Upload</Label>
                                <Input
                                    id="product-gallery-upload"
                                    name="image_gallery"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    onChange={onGalleryFilesChange}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">Upload more images to add them into this product gallery.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-size-chart-upload">Size Chart Image</Label>
                                <Input
                                    id="product-size-chart-upload"
                                    name="size_chart_files"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    multiple
                                    onChange={onSizeChartImageChange}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">Upload one or more images used as product size charts.</p>
                                {errors.size_chart_files && <p className="text-xs text-destructive">{errors.size_chart_files[0]}</p>}
                                {sizeChartPreviewItems.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-3">
                                        {sizeChartPreviewItems.map((item, index) => {
                                            const sourceIndex = sizeChartPreviewItems
                                                .slice(0, index)
                                                .filter((entry) => entry.source === item.source).length;

                                            return (
                                                <div key={item.id} className="space-y-2">
                                                    <img
                                                        src={item.url}
                                                        alt={item.name}
                                                        className="h-28 w-full rounded bg-muted/30 object-contain"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => onRemoveSizeChartImage?.({ source: item.source, index: sourceIndex })}
                                                        disabled={isSubmitting}
                                                    >
                                                        Remove Size Chart
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="mb-3 text-sm font-medium text-muted-foreground">Gallery Preview</p>
                                <p className="mb-2 text-xs text-muted-foreground">Drag and drop images to reorder them.</p>
                                {galleryPreviewItems.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {galleryPreviewItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className={`space-y-2 ${isSubmitting ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
                                                    draggingGalleryItem?.source === item.source
                                                    && draggingGalleryItem?.index
                                                        === galleryPreviewItems
                                                            .slice(0, index)
                                                            .filter((entry) => entry.source === item.source).length
                                                        ? 'opacity-60'
                                                        : ''
                                                }`}
                                                draggable={!isSubmitting}
                                                onDragStart={(event) => {
                                                    const sourceIndex = galleryPreviewItems
                                                        .slice(0, index)
                                                        .filter((entry) => entry.source === item.source).length;
                                                    handleGalleryDragStart(event, item.source, sourceIndex);
                                                }}
                                                onDragOver={handleGalleryDragOver}
                                                onDrop={(event) => {
                                                    const sourceIndex = galleryPreviewItems
                                                        .slice(0, index)
                                                        .filter((entry) => entry.source === item.source).length;
                                                    handleGalleryDrop(event, item.source, sourceIndex);
                                                }}
                                                onDragEnd={handleGalleryDragEnd}
                                                title="Drag to reorder"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.name}
                                                    className="h-24 w-full rounded bg-muted/30 object-contain"
                                                    draggable={false}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        if (item.source === 'existing') {
                                                            onRemoveExistingGalleryImage?.(index);
                                                            return;
                                                        }

                                                        const newIndex = galleryPreviewItems
                                                            .slice(0, index)
                                                            .filter((entry) => entry.source === 'new').length;
                                                        onRemoveNewGalleryImage?.(newIndex);
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-24 items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
                                        No gallery images available
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-videos-upload">Product Videos</Label>
                                <Input
                                    id="product-videos-upload"
                                    name="product_videos"
                                    type="file"
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    multiple
                                    onChange={onProductVideosChange}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">Upload additional videos for this product (MP4, WEBM, OGG, MOV, max 50MB each).</p>
                                {errors.product_videos && <p className="text-xs text-destructive">{errors.product_videos[0]}</p>}

                                <div className="rounded-md border bg-muted/20 p-3">
                                    <p className="mb-3 text-sm font-medium text-muted-foreground">Video Preview</p>
                                    {productVideoPreviewItems.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {productVideoPreviewItems.map((item, index) => (
                                                <div key={item.id || `${item.name}-${index}`} className="space-y-2">
                                                    <video
                                                        src={item.url}
                                                        controls
                                                        className="h-36 w-full rounded bg-muted/30 object-cover"
                                                        preload="metadata"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => {
                                                            if (item.source === 'existing') {
                                                                const existingIndex = productVideoPreviewItems
                                                                    .slice(0, index)
                                                                    .filter((entry) => entry.source === 'existing').length;
                                                                onRemoveExistingProductVideo?.(existingIndex);
                                                                return;
                                                            }

                                                            const newIndex = productVideoPreviewItems
                                                                .slice(0, index)
                                                                .filter((entry) => entry.source === 'new').length;
                                                            onRemoveNewProductVideo?.(newIndex);
                                                        }}
                                                        disabled={isSubmitting}
                                                    >
                                                        Remove Video
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-24 items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
                                            No product videos available
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Category</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="product-category">Category</Label>
                                        <select
                                            id="product-category"
                                            name="category_id"
                                            value={form.category_id ?? ''}
                                            onChange={onChange}
                                            disabled={isSubmitting || isOptionsLoading}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">{isOptionsLoading ? 'Loading categories...' : 'Select category'}</option>
                                            {categoryOptions.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product-subcategory">SubCategory</Label>
                                        <select
                                            id="product-subcategory"
                                            name="subcategory_id"
                                            value={form.subcategory_id ?? ''}
                                            onChange={onChange}
                                            disabled={isSubmitting || isOptionsLoading}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">{isOptionsLoading ? 'Loading subcategories...' : 'Select subcategory'}</option>
                                            {subCategoryOptions.map((subcategory) => (
                                                <option key={subcategory.id} value={subcategory.id}>
                                                    {subcategory.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subcategory_id && <p className="text-xs text-destructive">{errors.subcategory_id[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product-grandchild">GrandChild</Label>
                                        <select
                                            id="product-grandchild"
                                            name="grand_child_id"
                                            value={form.grand_child_id ?? ''}
                                            onChange={onChange}
                                            disabled={isSubmitting || isOptionsLoading}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">{isOptionsLoading ? 'Loading grand childs...' : 'Select grandchild'}</option>
                                            {grandChildOptions.map((grandChild) => (
                                                <option key={grandChild.id} value={grandChild.id}>
                                                    {grandChild.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.grand_child_id && <p className="text-xs text-destructive">{errors.grand_child_id[0]}</p>}
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-foreground">Variation</h3>
                                <div className="flex items-center gap-2 rounded-md border bg-muted/10 px-3 py-2">
                                    <Input
                                        id="product-best-sellers"
                                        name="show_on_best_sellers"
                                        type="checkbox"
                                        checked={Boolean(form.show_on_best_sellers)}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="product-best-sellers" className="cursor-pointer">
                                        Show on Best Sellers
                                    </Label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="product-color">Color</Label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                id="product-color"
                                                value={colorSelectValue}
                                                onChange={(event) => onColorSelectChange?.(event.target.value)}
                                                disabled={isSubmitting || isOptionsLoading}
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="">{isOptionsLoading ? 'Loading colors...' : 'Select a color'}</option>
                                                {colorOptions.map((color) => (
                                                    <option key={color.id} value={String(color.id)}>
                                                        {color.name}{color.color_code ? ` (${color.color_code})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={onAddColor}
                                                disabled={isSubmitting || isOptionsLoading || !colorSelectValue}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {selectedColors.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {selectedColors.map((color) => (
                                                    <div
                                                        key={color}
                                                        draggable={!isSubmitting}
                                                        onDragStart={(event) => handleColorDragStart(event, color)}
                                                        onDragOver={handleColorDragOver}
                                                        onDrop={(event) => handleColorDrop(event, color)}
                                                        onDragEnd={handleColorDragEnd}
                                                        className={`inline-flex items-center gap-2 rounded-md border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground ${
                                                            draggingColor === color ? 'opacity-60' : ''
                                                        } ${isSubmitting ? 'cursor-not-allowed' : 'cursor-move'}`}
                                                        title="Drag to reorder"
                                                    >
                                                        <span>{getColorLabel(color)}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onRemoveColor?.(color)}
                                                            disabled={isSubmitting}
                                                            className="text-[11px] leading-none opacity-70 transition-opacity hover:opacity-100"
                                                            aria-label={`Remove ${getColorLabel(color)}`}
                                                        >
                                                            x
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.color && <p className="text-xs text-destructive">{errors.color[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product-size">Size</Label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                id="product-size"
                                                value={sizeSelectValue}
                                                onChange={(event) => onSizeSelectChange?.(event.target.value)}
                                                disabled={isSubmitting || isOptionsLoading}
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="">{isOptionsLoading ? 'Loading sizes...' : 'Select a size'}</option>
                                                {sizeOptions.map((size) => (
                                                    <option key={size.id} value={String(size.id)}>
                                                        {size.size}
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={onAddSize}
                                                disabled={isSubmitting || isOptionsLoading || !sizeSelectValue}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {selectedSizes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {selectedSizes.map((size) => (
                                                    <Button
                                                        key={size}
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onRemoveSize?.(size)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {getSizeLabel(size)} x
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                        {errors.size && <p className="text-xs text-destructive">{errors.size[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product-stock">
                                            Stock <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="product-stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            value={form.stock ?? ''}
                                            onChange={onChange}
                                            placeholder="0"
                                            disabled={isSubmitting}
                                        />
                                        {errors.stock && <p className="text-xs text-destructive">{errors.stock[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product-price">
                                            Price <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="product-price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price ?? ''}
                                            onChange={onChange}
                                            placeholder="0.00"
                                        />
                                        {errors.price && <p className="text-xs text-destructive">{errors.price[0]}</p>}
                                    </div>
                                </div>
                            </div>

                            {variantRows.length > 0 && (
                                <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                                    <p className="text-sm font-medium">
                                        Variants
                                        {variantGroupName ? ` - ${variantGroupName}` : ''}
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[780px] text-sm">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="py-2 pr-2">Color</th>
                                                    <th className="py-2 pr-2">Size</th>
                                                    <th className="py-2 pr-2">SKU</th>
                                                    <th className="py-2 pr-2">Stock</th>
                                                    <th className="py-2 pr-2">Price</th>
                                                    <th className="py-2">Color Images</th>
                                                    <th className="py-2">Color Videos</th>
                                                    <th className="py-2">Size Charts</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variantRows.map((row) => (
                                                    <tr key={row.key} className="border-b last:border-0">
                                                        <td className="py-2 pr-2">{getColorLabel(row.color)}</td>
                                                        <td className="py-2 pr-2">{getSizeLabel(row.size)}</td>
                                                        <td className="py-2 pr-2">
                                                            <Input
                                                                value={row.sku ?? ''}
                                                                onChange={(event) => onVariantRowChange?.(row.key, 'sku', event.target.value)}
                                                                disabled={isSubmitting}
                                                            />
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={row.stock ?? ''}
                                                                onChange={(event) => onVariantRowChange?.(row.key, 'stock', event.target.value)}
                                                                disabled={isSubmitting}
                                                            />
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={row.price ?? ''}
                                                                onChange={(event) => onVariantRowChange?.(row.key, 'price', event.target.value)}
                                                                disabled={isSubmitting}
                                                            />
                                                        </td>
                                                        <td className="py-2">
                                                            {firstColorRowKeys[row.key] ? (
                                                                <div className="space-y-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full"
                                                                        onClick={() => openColorImagesModal(row.color)}
                                                                        disabled={isSubmitting || galleryPreviewItems.length === 0}
                                                                    >
                                                                        Attach Images
                                                                    </Button>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {(colorVariantImageMap[row.color] || []).length} selected for {getColorLabel(row.color)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">Uses {getColorLabel(row.color)} images</p>
                                                            )}
                                                        </td>
                                                        <td className="py-2">
                                                            {firstColorRowKeys[row.key] ? (
                                                                <div className="space-y-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full"
                                                                        onClick={() => openColorVideosModal(row.color)}
                                                                        disabled={isSubmitting || productVideoPreviewItems.length === 0}
                                                                    >
                                                                        Attach Videos
                                                                    </Button>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {(colorVariantVideoMap[row.color] || []).length} selected for {getColorLabel(row.color)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">Uses {getColorLabel(row.color)} videos</p>
                                                            )}
                                                        </td>
                                                        <td className="py-2">
                                                            {firstColorRowKeys[row.key] ? (
                                                                <div className="space-y-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full"
                                                                        onClick={() => openColorSizeChartsModal(row.color)}
                                                                        disabled={isSubmitting || sizeChartPreviewItems.length === 0}
                                                                    >
                                                                        Attach Size Charts
                                                                    </Button>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {(colorVariantSizeChartMap[row.color] || []).length} selected for {getColorLabel(row.color)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">Uses {getColorLabel(row.color)} size charts</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>

            {isImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-lg border bg-background shadow-lg">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Attach Images to {getColorLabel(activeColorForImages)}</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={closeColorImagesModal}>
                                Close
                            </Button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-4">
                            {galleryPreviewItems.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {galleryPreviewItems.map((image) => {
                                        const isSelected = draftImageValues.includes(image.value);

                                        return (
                                            <button
                                                key={image.id}
                                                type="button"
                                                onClick={() => toggleDraftImage(image.value)}
                                                className={`overflow-hidden rounded-md border text-left transition ${
                                                    isSelected
                                                        ? 'border-primary ring-2 ring-primary/30'
                                                        : 'border-input hover:border-primary/60'
                                                }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="h-40 w-full bg-muted/30 object-contain"
                                                />
                                                <div className="space-y-1 p-2">
                                                    <p className="truncate text-xs font-medium" title={image.name}>
                                                        {image.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {isSelected ? 'Selected' : 'Click to select'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Upload gallery images first to attach them to this color variant.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                            <Button type="button" variant="outline" onClick={closeColorImagesModal}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={saveColorImagesSelection}>
                                Save Selection ({draftImageValues.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isVideoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-lg border bg-background shadow-lg">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Attach Videos to {getColorLabel(activeColorForVideos)}</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={closeColorVideosModal}>
                                Close
                            </Button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-4">
                            {productVideoPreviewItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {productVideoPreviewItems.map((video) => {
                                        const isSelected = draftVideoValues.includes(video.value);

                                        return (
                                            <button
                                                key={video.id}
                                                type="button"
                                                onClick={() => toggleDraftVideo(video.value)}
                                                className={`overflow-hidden rounded-md border p-2 text-left transition ${
                                                    isSelected
                                                        ? 'border-primary ring-2 ring-primary/30'
                                                        : 'border-input hover:border-primary/60'
                                                }`}
                                            >
                                                <video
                                                    src={video.url}
                                                    className="h-36 w-full rounded bg-muted/30 object-cover"
                                                    preload="metadata"
                                                    muted
                                                />
                                                <div className="space-y-1 p-1">
                                                    <p className="truncate text-xs font-medium" title={video.name}>
                                                        {video.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {isSelected ? 'Selected' : 'Click to select'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Upload product videos first to attach them to this color variant.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                            <Button type="button" variant="outline" onClick={closeColorVideosModal}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={saveColorVideosSelection}>
                                Save Selection ({draftVideoValues.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isSizeChartModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-lg border bg-background shadow-lg">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Attach Size Charts to {getColorLabel(activeColorForSizeCharts)}</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={closeColorSizeChartsModal}>
                                Close
                            </Button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-4">
                            {sizeChartPreviewItems.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {sizeChartPreviewItems.map((item) => {
                                        const isSelected = draftSizeChartValues.includes(item.value);

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleDraftSizeChart(item.value)}
                                                className={`overflow-hidden rounded-md border text-left transition ${
                                                    isSelected
                                                        ? 'border-primary ring-2 ring-primary/30'
                                                        : 'border-input hover:border-primary/60'
                                                }`}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.name}
                                                    className="h-40 w-full bg-muted/30 object-contain"
                                                />
                                                <div className="space-y-1 p-2">
                                                    <p className="truncate text-xs font-medium" title={item.name}>
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {isSelected ? 'Selected' : 'Click to select'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Upload size charts first to attach them to this color variant.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                            <Button type="button" variant="outline" onClick={closeColorSizeChartsModal}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={saveColorSizeChartsSelection}>
                                Save Selection ({draftSizeChartValues.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}