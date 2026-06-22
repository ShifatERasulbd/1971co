import { GripVertical, Plus, Settings2, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

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

const ITEM_TYPE = 'COLLECTION_ITEM';

function CollectionItemRow({
    item,
    index,
    productOptions,
    onChangeItem,
    onUploadImage,
    onRemoveItem,
    onReorderItem,
}) {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ITEM_TYPE,
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [index]
    );

    const [, drop] = useDrop(
        () => ({
            accept: ITEM_TYPE,
            hover(draggedItem, monitor) {
                if (!ref.current || draggedItem.index === index) {
                    return;
                }

                const hoverRect = ref.current.getBoundingClientRect();
                const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
                const clientOffset = monitor.getClientOffset();
                if (!clientOffset) {
                    return;
                }

                const hoverClientY = clientOffset.y - hoverRect.top;

                if (draggedItem.index < index && hoverClientY < hoverMiddleY) {
                    return;
                }

                if (draggedItem.index > index && hoverClientY > hoverMiddleY) {
                    return;
                }

                onReorderItem(draggedItem.index, index);
                draggedItem.index = index;
            },
        }),
        [index, onReorderItem]
    );

    drag(drop(ref));

    const selectedProductIds = Array.isArray(item.productIds)
        ? item.productIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0)
        : [];

    function toggleProductId(productId) {
        const next = selectedProductIds.includes(productId)
            ? selectedProductIds.filter((id) => id !== productId)
            : [...selectedProductIds, productId];

        onChangeItem(index, 'productIds', next);
    }

    return (
        <div
            ref={ref}
            className={`space-y-3 rounded-md border border-border p-3 ${
                isDragging ? 'opacity-45' : 'opacity-100'
            }`}
        >
            <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <GripVertical className="size-3.5" />
                Drag to reorder
            </div>

            <div className="space-y-1">
                <Label htmlFor={`collection-image-${index}`}>Image</Label>
                <Input
                    id={`collection-image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            onUploadImage(index, file);
                        }
                    }}
                />
                {item.image ? (
                    <div className="overflow-hidden rounded-md border border-border bg-muted/20">
                        <img
                            src={item.image}
                            alt={item.name || `Collection ${index + 1}`}
                            className="h-24 w-full object-cover"
                        />
                    </div>
                ) : null}
            </div>

            <div className="space-y-1">
                <Label htmlFor={`collection-name-${index}`}>Name</Label>
                <Input
                    id={`collection-name-${index}`}
                    value={item.name || ''}
                    onChange={(event) => onChangeItem(index, 'name', event.target.value)}
                    placeholder="New Arrivals"
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor={`collection-slug-${index}`}>Slug</Label>
                <Input
                    id={`collection-slug-${index}`}
                    value={item.slug || ''}
                    onChange={(event) => onChangeItem(index, 'slug', event.target.value)}
                    placeholder="new-arrivals"
                />
            </div>

            <div className="space-y-1">
                <Label>Tagged products</Label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input bg-background p-2">
                    {productOptions.length > 0 ? (
                        productOptions.map((product) => {
                            const productId = Number(product.id);
                            const checked = selectedProductIds.includes(productId);

                            return (
                                <label
                                    key={`collection-product-${index}-${productId}`}
                                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs hover:bg-muted/40"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleProductId(productId)}
                                        className="size-3.5 rounded border-zinc-300 text-zinc-900"
                                    />
                                    <span className="line-clamp-1">{product.name}</span>
                                </label>
                            );
                        })
                    ) : (
                        <p className="text-xs text-muted-foreground">No products found.</p>
                    )}
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveItem(index)}
                className="w-full"
            >
                <Trash2 className="mr-2 size-4" />
                Remove Item
            </Button>
        </div>
    );
}

export default function CollectionsEditorDrawer({
    open,
    onOpenChange,
    value,
    activeItemIndex,
    onChangeField,
    onChangeItem,
    onUploadImage,
    onAddItem,
    onRemoveItem,
    onReorderItem,
    productOptions = [],
    onSave,
    isSaving,
}) {
    const hasActiveItem = Number.isInteger(activeItemIndex) && activeItemIndex >= 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[380px] lg:max-w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Collections Section Editor
                    </SheetTitle>
                    <SheetDescription>
                        {hasActiveItem
                            ? `Editing item ${activeItemIndex + 1}. Click outside cards in preview to show all items.`
                            : 'Customize title, layout, and collection cards.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    <div className="space-y-1">
                        <Label htmlFor="collections-title">Title</Label>
                        <Input
                            id="collections-title"
                            value={value.title || 'Collections'}
                            onChange={(event) => onChangeField('title', event.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="collections-title-position">Title position</Label>
                            <select
                                id="collections-title-position"
                                value={value.titlePosition || 'left'}
                                onChange={(event) =>
                                    onChangeField('titlePosition', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="collections-items-per-view">Items per view</Label>
                            <Input
                                id="collections-items-per-view"
                                type="number"
                                min={1}
                                max={6}
                                value={value.itemsPerView || 4}
                                onChange={(event) =>
                                    onChangeField(
                                        'itemsPerView',
                                        Math.max(1, Math.min(6, Number(event.target.value) || 4))
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {value.items
                            .map((item, index) => ({ item, index }))
                            .filter(({ index }) => !hasActiveItem || index === activeItemIndex)
                            .map(({ item, index }) => (
                                <CollectionItemRow
                                    key={`collection-item-${index}`}
                                    item={item}
                                    index={index}
                                    productOptions={productOptions}
                                    onChangeItem={onChangeItem}
                                    onUploadImage={onUploadImage}
                                    onRemoveItem={onRemoveItem}
                                    onReorderItem={onReorderItem}
                                />
                            ))}
                    </div>

                    <Button type="button" variant="outline" onClick={onAddItem} className="w-full">
                        <Plus className="mr-2 size-4" />
                        Add Collection Item
                    </Button>
                </div>

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save To Database'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
