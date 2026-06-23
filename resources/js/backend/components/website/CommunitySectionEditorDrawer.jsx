import { GripVertical, Plus, Settings2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

const sectionHints = {
    hero: 'Edit the main campaign heading and hero CTA section identity.',
    features: 'Configure the impact features panel and cards section label.',
    'community-center': 'Configure community center heading and programs section details.',
    gallery: 'Configure the community gallery label and showcase heading.',
    newsletter: 'Configure the newsletter call-to-action content area.',
};

const FEATURE_ITEM_TYPE = 'COMMUNITY_FEATURE_ITEM';

function moveFeatureItem(items, sourceIndex, targetIndex) {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}

function FeatureItemRow({ item, index, items, onChange, onRemove, onReorder }) {
    const [, dropRef] = useDrop(
        () => ({
            accept: FEATURE_ITEM_TYPE,
            hover: (dragged) => {
                if (dragged.index === index) {
                    return;
                }

                onReorder(dragged.index, index);
                dragged.index = index;
            },
        }),
        [index, onReorder],
    );

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: FEATURE_ITEM_TYPE,
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [index],
    );

    return (
        <div
            ref={dropRef}
            className={`rounded-md border border-border bg-muted/30 p-3 ${isDragging ? 'opacity-60' : 'opacity-100'}`}
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    ref={dragRef}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    <GripVertical className="size-4" />
                    Item {index + 1}
                </button>

                <button
                    type="button"
                    onClick={onRemove}
                    disabled={items.length <= 1}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-600 disabled:opacity-40"
                >
                    <Trash2 className="size-3.5" />
                    Remove
                </button>
            </div>

            <div className="space-y-2">
                <div className="space-y-1.5">
                    <Label htmlFor={`feature-item-icon-${item.id || index}`}>Icon</Label>
                    <Input
                        id={`feature-item-icon-${item.id || index}`}
                        value={item.icon || ''}
                        onChange={(event) => onChange('icon', event.target.value)}
                        placeholder="e.g., graduation-cap"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor={`feature-item-title-${item.id || index}`}>Title</Label>
                    <Input
                        id={`feature-item-title-${item.id || index}`}
                        value={item.title || ''}
                        onChange={(event) => onChange('title', event.target.value)}
                        placeholder="Feature title"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor={`feature-item-description-${item.id || index}`}>Description</Label>
                    <textarea
                        id={`feature-item-description-${item.id || index}`}
                        value={item.description || ''}
                        onChange={(event) => onChange('description', event.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        placeholder="Feature description"
                    />
                </div>
            </div>
        </div>
    );
}

function GalleryItemRow({ index, items, onRemove, onReorder, children }) {
    const [, dropRef] = useDrop(
        () => ({
            accept: FEATURE_ITEM_TYPE,
            hover: (dragged) => {
                if (dragged.index === index) {
                    return;
                }

                onReorder(dragged.index, index);
                dragged.index = index;
            },
        }),
        [index, onReorder],
    );

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: FEATURE_ITEM_TYPE,
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [index],
    );

    return (
        <div
            ref={dropRef}
            className={`rounded-md border border-border bg-muted/30 p-3 ${isDragging ? 'opacity-60' : 'opacity-100'}`}
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    ref={dragRef}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    <GripVertical className="size-4" />
                    Image {index + 1}
                </button>

                <button
                    type="button"
                    onClick={onRemove}
                    disabled={items.length <= 1}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-600 disabled:opacity-40"
                >
                    <Trash2 className="size-3.5" />
                    Remove
                </button>
            </div>

            {children}
        </div>
    );
}

export default function CommunitySectionEditorDrawer({
    open,
    onOpenChange,
    section,
    onChangeField,
    onSave,
}) {
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const featureItems = useMemo(() => {
        if (!section || section.key !== 'features') {
            return [];
        }

        return Array.isArray(section.featureItems) ? section.featureItems : [];
    }, [section]);

    const communityItems = useMemo(() => {
        if (!section || section.key !== 'community-center') {
            return [];
        }

        return Array.isArray(section.communityItems) ? section.communityItems : [];
    }, [section]);

    const galleryItems = useMemo(() => {
        if (!section || section.key !== 'gallery') {
            return [];
        }

        return Array.isArray(section.galleryItems) ? section.galleryItems : [];
    }, [section]);

    const handleSectionImageUpload = async (event, fieldName, successMessage) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploadingImage(true);

            const response = await fetch('/api/community-page-sections/upload-feature-image', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const payload = await response.json();
            onChangeField?.(fieldName, payload.url || payload.path || '');
            toast.success(successMessage);
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleFeatureImageUpload = (event) =>
        handleSectionImageUpload(event, 'featureImage', 'Impact features image uploaded');

    const handleCommunityImageUpload = (event) =>
        handleSectionImageUpload(event, 'communityImage', 'Community center image uploaded');

    const handleFeatureItemChange = (index, field, value) => {
        const next = featureItems.map((item, itemIndex) =>
            itemIndex === index
                ? {
                      ...item,
                      [field]: value,
                  }
                : item,
        );

        onChangeField?.('featureItems', next);
    };

    const handleFeatureItemReorder = (sourceIndex, targetIndex) => {
        const next = moveFeatureItem(featureItems, sourceIndex, targetIndex);
        onChangeField?.('featureItems', next);
    };

    const handleAddFeatureItem = () => {
        const next = [
            ...featureItems,
            {
                id: `feature-${Date.now()}`,
                icon: 'sparkles',
                title: '',
                description: '',
            },
        ];

        onChangeField?.('featureItems', next);
    };

    const handleRemoveFeatureItem = (index) => {
        const next = featureItems.filter((_, itemIndex) => itemIndex !== index);
        onChangeField?.('featureItems', next.length > 0 ? next : featureItems);
    };

    const handleCommunityItemChange = (index, field, value) => {
        const next = communityItems.map((item, itemIndex) =>
            itemIndex === index
                ? {
                      ...item,
                      [field]: value,
                  }
                : item,
        );

        onChangeField?.('communityItems', next);
    };

    const handleCommunityItemReorder = (sourceIndex, targetIndex) => {
        const next = moveFeatureItem(communityItems, sourceIndex, targetIndex);
        onChangeField?.('communityItems', next);
    };

    const handleAddCommunityItem = () => {
        const next = [
            ...communityItems,
            {
                id: `community-item-${Date.now()}`,
                icon: 'sparkles',
                title: '',
                description: '',
            },
        ];

        onChangeField?.('communityItems', next);
    };

    const handleRemoveCommunityItem = (index) => {
        const next = communityItems.filter((_, itemIndex) => itemIndex !== index);
        onChangeField?.('communityItems', next.length > 0 ? next : communityItems);
    };

    const handleGalleryItemChange = (index, field, value) => {
        const next = galleryItems.map((item, itemIndex) =>
            itemIndex === index
                ? {
                      ...item,
                      [field]: value,
                  }
                : item,
        );

        onChangeField?.('galleryItems', next);
    };

    const handleGalleryItemReorder = (sourceIndex, targetIndex) => {
        const next = moveFeatureItem(galleryItems, sourceIndex, targetIndex);
        onChangeField?.('galleryItems', next);
    };

    const handleAddGalleryItem = () => {
        const next = [
            ...galleryItems,
            {
                id: `gallery-item-${Date.now()}`,
                src: '',
                alt: '',
                label: 'Community',
                date: new Date().toISOString().slice(0, 10),
            },
        ];

        onChangeField?.('galleryItems', next);
    };

    const handleRemoveGalleryItem = (index) => {
        const next = galleryItems.filter((_, itemIndex) => itemIndex !== index);
        onChangeField?.('galleryItems', next.length > 0 ? next : galleryItems);
    };

    const handleGalleryItemImageUpload = async (index, event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploadingImage(true);

            const response = await fetch('/api/community-page-sections/upload-feature-image', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload gallery image');
            }

            const payload = await response.json();
            handleGalleryItemChange(index, 'src', payload.url || payload.path || '');
            toast.success('Gallery image uploaded');
        } catch {
            toast.error('Failed to upload gallery image');
        } finally {
            setIsUploadingImage(false);
            event.target.value = '';
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[420px] lg:max-w-[460px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Community Component Drawer
                    </SheetTitle>
                    <SheetDescription>
                        Edit selected community page component details and publish directly to preview.
                    </SheetDescription>
                </SheetHeader>

                {!section ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                        Select a component from Community Page Components to edit.
                    </div>
                ) : (
                    <div className="space-y-5 px-4 pb-4">
                        {section.key !== 'features' && section.key !== 'community-center' && section.key !== 'gallery' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="community-section-content-title">Content Title</Label>
                                    <Input
                                        id="community-section-content-title"
                                        value={section.contentTitle || ''}
                                        onChange={(event) => onChangeField?.('contentTitle', event.target.value)}
                                        placeholder="e.g., Together We Grow"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-section-heading">Heading</Label>
                                    <textarea
                                        id="community-section-heading"
                                        value={section.heading || ''}
                                        onChange={(event) => onChangeField?.('heading', event.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                                        placeholder="Main heading text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-section-description">Description</Label>
                                    <textarea
                                        id="community-section-description"
                                        value={section.sectionDescription || ''}
                                        onChange={(event) => onChangeField?.('sectionDescription', event.target.value)}
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                                        placeholder="Section description text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-section-status">Status</Label>
                                    <select
                                        id="community-section-status"
                                        value={section.status || 'active'}
                                        onChange={(event) => onChangeField?.('status', event.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="active">active</option>
                                        <option value="inactive">inactive</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-section-button-text">Button Text</Label>
                                    <Input
                                        id="community-section-button-text"
                                        value={section.buttonText || ''}
                                        onChange={(event) => onChangeField?.('buttonText', event.target.value)}
                                        placeholder="Button label (e.g., Learn More, Subscribe)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-section-button-url">Button URL</Label>
                                    <Input
                                        id="community-section-button-url"
                                        value={section.buttonUrl || ''}
                                        onChange={(event) => onChangeField?.('buttonUrl', event.target.value)}
                                        placeholder="Button URL (e.g., /products, #gallery)"
                                    />
                                </div>
                            </>
                        )}

                        {section.key === 'community-center' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="community-center-content-title">Content Title</Label>
                                    <Input
                                        id="community-center-content-title"
                                        value={section.contentTitle || ''}
                                        onChange={(event) => onChangeField?.('contentTitle', event.target.value)}
                                        placeholder="e.g., Community Center"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-center-heading">Heading</Label>
                                    <textarea
                                        id="community-center-heading"
                                        value={section.heading || ''}
                                        onChange={(event) => onChangeField?.('heading', event.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                                        placeholder="Main heading text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="community-center-image">Community Center Image</Label>
                                    <Input
                                        id="community-center-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCommunityImageUpload}
                                        disabled={isUploadingImage}
                                    />
                                    {section.communityImage ? (
                                        <img
                                            src={section.communityImage}
                                            alt="Community center preview"
                                            className="h-28 w-full rounded-md border border-border object-cover"
                                        />
                                    ) : null}
                                    <p className="text-xs text-muted-foreground">
                                        {isUploadingImage ? 'Uploading image...' : 'Upload image shown at the right side of this section.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Community Cards Repeater</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddCommunityItem}>
                                            <Plus className="mr-1 size-3.5" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {communityItems.map((item, index) => (
                                            <FeatureItemRow
                                                key={item.id || `community-item-${index}`}
                                                item={item}
                                                index={index}
                                                items={communityItems}
                                                onChange={(field, value) => handleCommunityItemChange(index, field, value)}
                                                onRemove={() => handleRemoveCommunityItem(index)}
                                                onReorder={handleCommunityItemReorder}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {section.key === 'features' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="community-features-image">Impact Features Image</Label>
                                    <Input
                                        id="community-features-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFeatureImageUpload}
                                        disabled={isUploadingImage}
                                    />
                                    {section.featureImage ? (
                                        <img
                                            src={section.featureImage}
                                            alt="Impact features preview"
                                            className="h-28 w-full rounded-md border border-border object-cover"
                                        />
                                    ) : null}
                                    <p className="text-xs text-muted-foreground">
                                        {isUploadingImage ? 'Uploading image...' : 'Upload image shown above the feature cards.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Feature Cards Repeater</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddFeatureItem}>
                                            <Plus className="mr-1 size-3.5" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {featureItems.map((item, index) => (
                                            <FeatureItemRow
                                                key={item.id || `feature-item-${index}`}
                                                item={item}
                                                index={index}
                                                items={featureItems}
                                                onChange={(field, value) => handleFeatureItemChange(index, field, value)}
                                                onRemove={() => handleRemoveFeatureItem(index)}
                                                onReorder={handleFeatureItemReorder}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {section.key === 'gallery' && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Community Gallery Repeater</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddGalleryItem}>
                                            <Plus className="mr-1 size-3.5" />
                                            Add Image
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {galleryItems.map((item, index) => (
                                            <GalleryItemRow
                                                key={item.id || `gallery-item-${index}`}
                                                index={index}
                                                items={galleryItems}
                                                onRemove={() => handleRemoveGalleryItem(index)}
                                                onReorder={handleGalleryItemReorder}
                                            >
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gallery-item-file-${index}`}>Image</Label>
                                                    <Input
                                                        id={`gallery-item-file-${index}`}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(event) => handleGalleryItemImageUpload(index, event)}
                                                        disabled={isUploadingImage}
                                                    />
                                                    {item.src ? (
                                                        <img
                                                            src={item.src}
                                                            alt={item.alt || 'Gallery preview'}
                                                            className="h-28 w-full rounded-md border border-border bg-white object-contain"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor={`gallery-item-alt-${index}`}>Alt Text</Label>
                                                        <Input
                                                            id={`gallery-item-alt-${index}`}
                                                            value={item.alt || ''}
                                                            onChange={(event) => handleGalleryItemChange(index, 'alt', event.target.value)}
                                                            placeholder="Image alt text"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label htmlFor={`gallery-item-label-${index}`}>Label</Label>
                                                        <Input
                                                            id={`gallery-item-label-${index}`}
                                                            value={item.label || ''}
                                                            onChange={(event) => handleGalleryItemChange(index, 'label', event.target.value)}
                                                            placeholder="e.g., Community"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label htmlFor={`gallery-item-date-${index}`}>Date</Label>
                                                        <Input
                                                            id={`gallery-item-date-${index}`}
                                                            value={item.date || ''}
                                                            onChange={(event) => handleGalleryItemChange(index, 'date', event.target.value)}
                                                            placeholder="YYYY-MM-DD"
                                                        />
                                                    </div>
                                                </div>
                                            </GalleryItemRow>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                            {sectionHints[section.key] || 'Use this drawer to update selected section metadata.'}
                        </div>
                    </div>
                )}

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={!section}>
                        Save Section
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
