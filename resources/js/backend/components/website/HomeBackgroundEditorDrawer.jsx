import { Image as ImageIcon, Plus, Settings2, Trash2 } from 'lucide-react';

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

export default function HomeBackgroundEditorDrawer({
    open,
    onOpenChange,
    value,
    onUploadImage,
    onAddItem,
    onRemoveItem,
    onChangeItem,
    onSave,
    isSaving,
}) {
    const items = Array.isArray(value?.items) ? value.items : [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[390px] lg:max-w-[420px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Home Background Section
                    </SheetTitle>
                    <SheetDescription>
                        Add multiple slides with image, title, description, button, and visibility settings.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    {items.map((item, index) => (
                        <div key={item.id || index} className="space-y-3 rounded-md border border-border p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Slide {index + 1}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRemoveItem?.(index)}
                                    disabled={items.length <= 1}
                                >
                                    <Trash2 className="mr-1 size-4" />
                                    Remove
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2" htmlFor={`home-background-image-upload-${index}`}>
                                    <ImageIcon className="size-4" />
                                    Background image
                                </Label>
                                <Input
                                    id={`home-background-image-upload-${index}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            onUploadImage?.(index, file);
                                        }
                                    }}
                                />
                                {item?.image ? (
                                    <img
                                        src={item.image}
                                        alt={`Home background preview ${index + 1}`}
                                        className="h-40 w-full rounded-md border border-border object-cover"
                                    />
                                ) : null}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`home-background-title-${index}`}>Title</Label>
                                <Input
                                    id={`home-background-title-${index}`}
                                    value={item?.title || ''}
                                    onChange={(event) => onChangeItem?.(index, 'title', event.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`home-background-description-${index}`}>Description</Label>
                                <textarea
                                    id={`home-background-description-${index}`}
                                    rows={4}
                                    value={item?.description || ''}
                                    onChange={(event) => onChangeItem?.(index, 'description', event.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`home-background-button-text-${index}`}>Button text</Label>
                                <Input
                                    id={`home-background-button-text-${index}`}
                                    value={item?.button_text || ''}
                                    onChange={(event) => onChangeItem?.(index, 'button_text', event.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`home-background-button-url-${index}`}>Button URL</Label>
                                <Input
                                    id={`home-background-button-url-${index}`}
                                    value={item?.button_url || ''}
                                    onChange={(event) => onChangeItem?.(index, 'button_url', event.target.value)}
                                />
                            </div>

                            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                                <span>Show button</span>
                                <input
                                    type="checkbox"
                                    checked={Boolean(item?.show_button)}
                                    onChange={(event) => onChangeItem?.(index, 'show_button', event.target.checked)}
                                />
                            </label>
                        </div>
                    ))}

                    <Button type="button" variant="outline" className="w-full" onClick={() => onAddItem?.()}>
                        <Plus className="mr-2 size-4" />
                        Add Slide
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
