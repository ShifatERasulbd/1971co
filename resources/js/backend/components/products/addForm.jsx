import { useMemo, useState } from 'react';
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

export default function AddForm({
    form = {},
    errors = {},
    isSubmitting = false,
    colorOptions = [],
    sizeOptions = [],
    isOptionsLoading = false,
    colorSelectValue = '',
    sizeSelectValue = '',
    selectedColors = [],
    selectedSizes = [],
    variantRows = [],
    colorVariantImageMap = {},
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
    onRemoveGalleryImage,
    galleryPreviewUrls = [],
    onSubmit,
    onCancel,
    submitLabel = 'Create Product',
    submittingLabel = 'Saving...',
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

    const toggleDraftImage = (imageValue) => {
        setDraftImageValues((previous) =>
            previous.includes(imageValue)
                ? previous.filter((value) => value !== imageValue)
                : [...previous, imageValue],
        );
    };

    const saveColorImagesSelection = () => {
        if (activeColorForImages) {
            onColorVariantImagesChange?.(activeColorForImages, draftImageValues);
        }
        setIsImageModalOpen(false);
        setActiveColorForImages('');
        setDraftImageValues([]);
    };

    const closeColorImagesModal = () => {
        setIsImageModalOpen(false);
        setActiveColorForImages('');
        setDraftImageValues([]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Product</CardTitle>
                <CardDescription>Create a new product record for inventory.</CardDescription>
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
                                <textarea
                                    id="product-description"
                                    name="description"
                                    rows={3}
                                    value={form.description || ''}
                                    onChange={onChange}
                                    placeholder="Short product description"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description[0]}</p>}
                            </div>

                            <RichTextEditor
                                label="Long Description"
                                value={form.long_description || ''}
                                onChange={(html) => onChange({ target: { name: 'long_description', value: html } })}
                                placeholder="Detailed product description with formatting"
                                error={errors.long_description}
                            />

                            <RichTextEditor
                                label="Additional Information"
                                value={form.additional_information || ''}
                                onChange={(html) => onChange({ target: { name: 'additional_information', value: html } })}
                                placeholder="Additional details, specifications, care instructions, etc."
                                error={errors.additional_information}
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
                                <p className="text-xs text-muted-foreground">Select multiple gallery images (JPG, PNG, WEBP, max 4MB each).</p>
                                {errors.image_gallery && <p className="text-xs text-destructive">{errors.image_gallery[0]}</p>}
                            </div>
                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="mb-3 text-sm font-medium text-muted-foreground">Gallery Preview</p>
                                {galleryPreviewUrls.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {galleryPreviewUrls.map((item, index) => (
                                            <div key={`${item.name}-${index}`} className="space-y-2">
                                                <img
                                                    src={item.url}
                                                    alt={`Gallery preview ${index + 1}`}
                                                    className="h-32 w-full rounded bg-muted/30 object-contain"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => onRemoveGalleryImage?.(index)}
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-24 items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
                                        Upload gallery images to preview here
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Variation</h3>
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

                                {variantRows.length > 0 && (
                                    <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                                        <p className="text-sm font-medium">Variants</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[720px] text-sm">
                                                <thead>
                                                    <tr className="border-b text-left">
                                                        <th className="py-2 pr-2">Color</th>
                                                        <th className="py-2 pr-2">Size</th>
                                                        <th className="py-2 pr-2">SKU</th>
                                                        <th className="py-2 pr-2">Stock</th>
                                                        <th className="py-2">Price</th>
                                                        <th className="py-2 pl-2">Color Images</th>
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
                                                            <td className="py-2">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={row.price ?? ''}
                                                                    onChange={(event) => onVariantRowChange?.(row.key, 'price', event.target.value)}
                                                                    disabled={isSubmitting}
                                                                />
                                                            </td>
                                                            <td className="py-2 pl-2 align-top">
                                                                {firstColorRowKeys[row.key] ? (
                                                                    <div className="space-y-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full"
                                                                            onClick={() => openColorImagesModal(row.color)}
                                                                            disabled={isSubmitting || galleryPreviewUrls.length === 0}
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
                            {galleryPreviewUrls.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {galleryPreviewUrls.map((image) => {
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