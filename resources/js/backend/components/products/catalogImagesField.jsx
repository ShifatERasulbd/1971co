import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CatalogImagesField({
    thumbPreviewUrl = '',
    selectedThumb = '',
    galleryImages = [],
    selectedFeatureImages = [],
    newFeatureImages = [],
    onThumbFileChange,
    onFeatureFilesChange,
    onSelectThumb,
    onToggleFeature,
    onRemoveThumb,
    onRemoveFeatureFile,
    swatchPreviewUrl = '',
    onSwatchFileChange,
    onRemoveSwatch,
    colors = [],
    getColorLabel = (value) => value,
    colorVariantImageMap = {},
    selectedColorImages = {},
    onSelectColorImage,
    errors = {},
    disabled = false,
}) {
    const selectedGalleryThumb = galleryImages.find((image) => image.value === selectedThumb);
    const displayedThumbUrl = thumbPreviewUrl || selectedGalleryThumb?.url || '';
    const featureImageCount = selectedFeatureImages.length + newFeatureImages.length;
    // Each colour's own images (from the colour variant images), to pick its "Available Colors" image from
    const colorImageGroups = colors.map((color) => ({
        color,
        label: getColorLabel(color),
        images: (colorVariantImageMap[color] || []).map((value) => {
            const image = galleryImages.find((item) => item.value === value);
            return { value, url: image?.url || value, name: image?.name || value };
        }),
    }));

    return (
        <section className="space-y-5 rounded-lg border p-4">
            <div>
                <h3 className="text-base font-semibold">Catalog Images</h3>
                <p className="text-sm text-muted-foreground">
                    Choose one thumbnail and the feature images to show in the catalog. You can reuse product gallery images or upload separate catalog images.
                </p>
            </div>

            <div className="space-y-3">
                <Label htmlFor="catalog-thumb-file">Catalog thumbnail (one image)</Label>
                <Input
                    id="catalog-thumb-file"
                    name="catalog_thumb_file"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={onThumbFileChange}
                    disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">Upload one image, or choose one from the existing product gallery below. Maximum 4MB.</p>
                {errors.catalog_thumb_file && <p className="text-xs text-destructive">{errors.catalog_thumb_file[0]}</p>}

                {displayedThumbUrl ? (
                    <div className="flex items-center gap-3 rounded-md border p-2">
                        <img src={displayedThumbUrl} alt="Catalog thumbnail preview" className="size-20 rounded bg-muted/30 object-contain" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Selected catalog thumbnail</p>
                            <p className="truncate text-xs text-muted-foreground">{selectedThumb || 'New upload'}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={onRemoveThumb} disabled={disabled}>
                            Remove
                        </Button>
                    </div>
                ) : null}

                {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {galleryImages.map((image) => {
                            const isSelected = selectedThumb === image.value;
                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => onSelectThumb?.(image.value)}
                                    disabled={disabled}
                                    className={`overflow-hidden rounded-md border text-left ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/60'}`}
                                >
                                    <img src={image.url} alt={image.name} className="h-28 w-full bg-muted/30 object-contain" />
                                    <span className="block truncate p-2 text-xs">{isSelected ? 'Selected thumbnail' : 'Use as thumbnail'}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </div>

            <div className="space-y-3 border-t pt-4">
                <Label htmlFor="catalog-feature-files">Catalog feature images (multiple)</Label>
                <Input
                    id="catalog-feature-files"
                    name="catalog_feature_files"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={onFeatureFilesChange}
                    disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">Select up to 6 images, or choose several from the existing product gallery. Maximum 4MB each.</p>
                {errors.catalog_feature_files && <p className="text-xs text-destructive">{errors.catalog_feature_files[0]}</p>}

                {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {galleryImages.map((image) => {
                            const isSelected = selectedFeatureImages.includes(image.value);
                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => onToggleFeature?.(image.value)}
                                    disabled={disabled || (!isSelected && featureImageCount >= 6)}
                                    className={`overflow-hidden rounded-md border text-left ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/60'}`}
                                >
                                    <img src={image.url} alt={image.name} className="h-28 w-full bg-muted/30 object-contain" />
                                    <span className="block truncate p-2 text-xs">{isSelected ? 'Selected feature image' : 'Add to feature images'}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                {newFeatureImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {newFeatureImages.map((image, index) => (
                            <div key={image.id} className="overflow-hidden rounded-md border">
                                <img src={image.url} alt={image.name} className="h-28 w-full bg-muted/30 object-contain" />
                                <div className="flex items-center gap-2 p-2">
                                    <span className="min-w-0 flex-1 truncate text-xs" title={image.name}>{image.name}</span>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveFeatureFile?.(index)} disabled={disabled}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="space-y-3 border-t pt-4">
                <Label htmlFor="catalog-swatch-file">Swatch fabric image (one image)</Label>
                <Input
                    id="catalog-swatch-file"
                    name="catalog_swatch_file"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={onSwatchFileChange}
                    disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">Square fabric close-up shown in the catalog swatch box. Maximum 4MB.</p>
                {errors.catalog_swatch_file && <p className="text-xs text-destructive">{errors.catalog_swatch_file[0]}</p>}

                {swatchPreviewUrl ? (
                    <div className="flex items-center gap-3 rounded-md border p-2">
                        <img src={swatchPreviewUrl} alt="Swatch fabric preview" className="size-20 rounded bg-muted/30 object-cover" />
                        <p className="min-w-0 flex-1 text-sm font-medium">Selected swatch image</p>
                        <Button type="button" variant="outline" size="sm" onClick={onRemoveSwatch} disabled={disabled}>
                            Remove
                        </Button>
                    </div>
                ) : null}
            </div>

            <div className="space-y-3 border-t pt-4">
                <Label>Available colors image (one image per color)</Label>
                <p className="text-xs text-muted-foreground">
                    Choose the image shown for each color under "Available Colors" in the catalog. Click a selected image again to clear it. Colors without a choice use their first image.
                </p>

                {colorImageGroups.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Add colors and their images in the variants section first.</p>
                ) : (
                    colorImageGroups.map((group) => (
                        <div key={group.color} className="space-y-2">
                            <p className="text-sm font-medium">{group.label}</p>
                            {group.images.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No images assigned to this color yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {group.images.map((image) => {
                                        const isSelected = selectedColorImages?.[group.color] === image.value;
                                        return (
                                            <button
                                                key={image.value}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => onSelectColorImage?.(group.color, image.value)}
                                                disabled={disabled}
                                                className={`overflow-hidden rounded-md border text-left ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/60'}`}
                                            >
                                                <img src={image.url} alt={image.name} className="h-28 w-full bg-muted/30 object-contain" />
                                                <span className="block truncate p-2 text-xs">{isSelected ? 'Selected color image' : 'Use for this color'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
