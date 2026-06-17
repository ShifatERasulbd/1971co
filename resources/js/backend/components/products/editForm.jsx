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
    galleryPreviewItems = [],
    variantGroupName = '',
    errors = {},
    isSubmitting = false,
    onChange,
    onColorSelectChange,
    onSizeSelectChange,
    onAddColor,
    onRemoveColor,
    onAddSize,
    onRemoveSize,
    onVariantRowChange,
    onColorVariantImagesChange,
    onGalleryFilesChange,
    onRemoveExistingGalleryImage,
    onRemoveNewGalleryImage,
    onSizeChartImageChange,
    onRemoveSizeChartImage,
    sizeChartPreviewUrl = '',
    onSubmit,
    onCancel,
    submitLabel = 'Update Product',
    submittingLabel = 'Updating...',
}) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeColorForImages, setActiveColorForImages] = useState('');
    const [draftImageValues, setDraftImageValues] = useState([]);

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

                            <RichTextEditor
                                label="Product Features"
                                value={form.product_features || ''}
                                onChange={(html) => onChange({ target: { name: 'product_features', value: html } })}
                                placeholder="Highlight key features and selling points"
                                error={errors.product_features}
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
                                    name="size_chart_image_file"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={onSizeChartImageChange}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">Upload one image used as the product size chart.</p>
                                {errors.size_chart_image_file && <p className="text-xs text-destructive">{errors.size_chart_image_file[0]}</p>}
                                {sizeChartPreviewUrl ? (
                                    <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                                        <img
                                            src={sizeChartPreviewUrl}
                                            alt="Size chart preview"
                                            className="h-48 w-full rounded bg-muted/30 object-contain"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={onRemoveSizeChartImage}
                                            disabled={isSubmitting}
                                        >
                                            Remove Size Chart
                                        </Button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="mb-3 text-sm font-medium text-muted-foreground">Gallery Preview</p>
                                {galleryPreviewItems.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {galleryPreviewItems.map((item, index) => (
                                            <div key={item.id} className="space-y-2">
                                                <img
                                                    src={item.url}
                                                    alt={item.name}
                                                    className="h-24 w-full rounded bg-muted/30 object-contain"
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
                                                    <option key={color.id} value={color.name || ''}>
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
                                                    <Button
                                                        key={color}
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onRemoveColor?.(color)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {color} x
                                                    </Button>
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
                                                    <option key={size.id} value={size.size || ''}>
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
                                                        {size} x
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variantRows.map((row) => (
                                                    <tr key={row.key} className="border-b last:border-0">
                                                        <td className="py-2 pr-2">{row.color}</td>
                                                        <td className="py-2 pr-2">{row.size}</td>
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
                                                                        {(colorVariantImageMap[row.color] || []).length} selected for {row.color}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">Uses {row.color} images</p>
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
                            <h3 className="text-base font-semibold">Attach Images to {activeColorForImages}</h3>
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
        </Card>
    );
}