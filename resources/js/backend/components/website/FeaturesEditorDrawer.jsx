import { GripVertical, Settings2 } from 'lucide-react';
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

const ITEM_TYPE = 'FEATURE_ITEM';

function FeatureItemRow({ item, index, onChangeItem, onReorderItem }) {
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

    return (
        <div
            ref={ref}
            className={`space-y-2 rounded-md border border-border p-3 ${
                isDragging ? 'opacity-45' : 'opacity-100'
            }`}
        >
            <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <GripVertical className="size-3.5" />
                Drag to reorder
            </div>

            <div className="space-y-1">
                <Label htmlFor={`feature-title-${index}`}>Card title</Label>
                <Input
                    id={`feature-title-${index}`}
                    value={item.title}
                    onChange={(event) => onChangeItem(index, 'title', event.target.value)}
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor={`feature-description-${index}`}>Card description</Label>
                <textarea
                    id={`feature-description-${index}`}
                    rows={3}
                    value={item.description}
                    onChange={(event) => onChangeItem(index, 'description', event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>
        </div>
    );
}

export default function FeaturesEditorDrawer({
    open,
    onOpenChange,
    value,
    activeItemIndex,
    onChangeField,
    onChangeItem,
    onReorderItem,
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
                        Features Section Editor
                    </SheetTitle>
                    <SheetDescription>
                        {hasActiveItem
                            ? `Editing card ${activeItemIndex + 1}. Click outside cards in preview to show all cards.`
                            : 'Customize feature cards and drag to change their order.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="features-title-font-family">Title font family</Label>
                            <select
                                id="features-title-font-family"
                                value={value.titleFontFamily || 'instrument-sans'}
                                onChange={(event) =>
                                    onChangeField('titleFontFamily', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="instrument-sans">Instrument Sans</option>
                                <option value="sora">Sora</option>
                                <option value="manrope">Manrope</option>
                                <option value="inter">Inter</option>
                                <option value="playfair-display">Playfair Display</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="features-title-font-size">Title font size</Label>
                            <Input
                                id="features-title-font-size"
                                type="number"
                                min={14}
                                max={72}
                                value={value.titleFontSize || 28}
                                onChange={(event) =>
                                    onChangeField('titleFontSize', Number(event.target.value) || 28)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="features-description-font-family">Description font family</Label>
                            <select
                                id="features-description-font-family"
                                value={value.descriptionFontFamily || 'instrument-sans'}
                                onChange={(event) =>
                                    onChangeField('descriptionFontFamily', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="instrument-sans">Instrument Sans</option>
                                <option value="sora">Sora</option>
                                <option value="manrope">Manrope</option>
                                <option value="inter">Inter</option>
                                <option value="playfair-display">Playfair Display</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="features-description-font-size">Description font size</Label>
                            <Input
                                id="features-description-font-size"
                                type="number"
                                min={10}
                                max={48}
                                value={value.descriptionFontSize || 16}
                                onChange={(event) =>
                                    onChangeField(
                                        'descriptionFontSize',
                                        Number(event.target.value) || 16
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="features-columns">Columns (desktop)</Label>
                        <Input
                            id="features-columns"
                            type="number"
                            min={1}
                            max={4}
                            value={value.columns || 4}
                            onChange={(event) =>
                                onChangeField('columns', Number(event.target.value) || 4)
                            }
                        />
                    </div>

                    <div className="space-y-3">
                        {value.items
                            .map((item, index) => ({ item, index }))
                            .filter(({ index }) => !hasActiveItem || index === activeItemIndex)
                            .map(({ item, index }) => (
                                <FeatureItemRow
                                    key={`feature-item-${index}`}
                                    item={item}
                                    index={index}
                                    onChangeItem={onChangeItem}
                                    onReorderItem={onReorderItem}
                                />
                            ))}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={onSave} disabled={isSaving}>
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
