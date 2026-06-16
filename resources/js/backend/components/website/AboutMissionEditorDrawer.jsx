import { GripVertical, Image as ImageIcon, Plus, Settings2, Trash2 } from 'lucide-react';
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

const ITEM_TYPE = 'ABOUT_MISSION_ITEM';

const iconOptions = [
    'BadgeCheck',
    'SlidersHorizontal',
    'Gift',
    'Handshake',
    'Sparkles',
    'ShieldCheck',
    'Package',
    'Star',
];

function MissionItemRow({ item, index, onChangeItem, onRemoveItem, onReorderItem }) {
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

    const [{ isOver }, drop] = useDrop(
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
                const movingForward = draggedItem.index < index;
                const crossedY = movingForward
                    ? hoverClientY >= hoverMiddleY
                    : hoverClientY <= hoverMiddleY;

                if (!crossedY) {
                    return;
                }

                onReorderItem(draggedItem.index, index);
                draggedItem.index = index;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [index, onReorderItem]
    );

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={[
                'rounded-md border border-border p-3 transition-colors',
                isDragging ? 'opacity-40' : '',
                isOver ? 'bg-muted/60' : 'bg-background',
            ].join(' ')}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <GripVertical className="size-4 text-muted-foreground" />
                    Item {index + 1}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveItem(index)}
                    title="Remove item"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <Label>Icon</Label>
                    <select
                        value={item.icon || 'BadgeCheck'}
                        onChange={(event) => onChangeItem(index, 'icon', event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {iconOptions.map((iconName) => (
                            <option key={iconName} value={iconName}>
                                {iconName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <Label>Icon title</Label>
                    <Input
                        value={item.title || ''}
                        onChange={(event) => onChangeItem(index, 'title', event.target.value)}
                        placeholder="Premium-Quality"
                    />
                </div>
            </div>
        </div>
    );
}

export default function AboutMissionEditorDrawer({
    open,
    onOpenChange,
    value,
    onChangeField,
    onUploadImage,
    onChangeItem,
    onAddItem,
    onRemoveItem,
    onReorderItem,
    onSave,
    isSaving,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[480px] lg:max-w-[560px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Our Mission Editor
                    </SheetTitle>
                    <SheetDescription>
                        Edit title, description, and mission items. Drag and drop items to reorder.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2" htmlFor="about-mission-image-upload">
                            <ImageIcon className="size-4" />
                            Background image
                        </Label>
                        <Input
                            id="about-mission-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadImage?.(file);
                                }
                            }}
                        />
                        {value.background_image ? (
                            <img
                                src={value.background_image}
                                alt="About mission background preview"
                                className="h-44 w-full rounded-md border border-border object-cover"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-mission-title">Section title</Label>
                        <Input
                            id="about-mission-title"
                            value={value.title || ''}
                            onChange={(event) => onChangeField('title', event.target.value)}
                            placeholder="Our Mission"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-mission-description">Description</Label>
                        <textarea
                            id="about-mission-description"
                            value={value.description || ''}
                            onChange={(event) => onChangeField('description', event.target.value)}
                            rows={5}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                            placeholder="Our mission is to make personalized fashion accessible..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Repeater items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
                                <Plus className="mr-1 size-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {(value.items || []).map((item, index) => (
                                <MissionItemRow
                                    key={`${item.icon || 'item'}-${index}`}
                                    item={item}
                                    index={index}
                                    onChangeItem={onChangeItem}
                                    onRemoveItem={onRemoveItem}
                                    onReorderItem={onReorderItem}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={isSaving}>
                        {isSaving ? 'Saving Mission...' : 'Save To Database'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
