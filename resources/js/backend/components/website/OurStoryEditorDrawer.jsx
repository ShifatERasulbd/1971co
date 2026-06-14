import { Image as ImageIcon, Palette, Settings2, Type } from 'lucide-react';

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

export default function OurStoryEditorDrawer({
    open,
    onOpenChange,
    value,
    onChangeField,
    onUploadImage,
    onUploadLogo,
    onSave,
    isSaving,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[390px] lg:max-w-[420px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Our Story Section Editor
                    </SheetTitle>
                    <SheetDescription>
                        Customize image, logo, labels, visibility toggles, and background color.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2" htmlFor="our-story-image-upload">
                            <ImageIcon className="size-4" />
                            Story image
                        </Label>
                        <Input
                            id="our-story-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadImage(file);
                                }
                            }}
                        />
                        {value.story_image ? (
                            <img
                                src={value.story_image}
                                alt="Story"
                                className="h-28 w-full rounded-md border border-border object-cover"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2" htmlFor="our-story-logo-upload">
                            <ImageIcon className="size-4" />
                            Story logo
                        </Label>
                        <Input
                            id="our-story-logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadLogo(file);
                                }
                            }}
                        />
                        {value.story_logo ? (
                            <img
                                src={value.story_logo}
                                alt="Story logo"
                                className="h-20 w-auto max-w-full rounded-md border border-border bg-white p-2 object-contain"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="our-story-section-title" className="flex items-center gap-2">
                            <Type className="size-4" />
                            Section title
                        </Label>
                        <Input
                            id="our-story-section-title"
                            value={value.section_title || ''}
                            onChange={(event) => onChangeField('section_title', event.target.value)}
                            placeholder="Our Story"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="our-story-title">Title</Label>
                        <Input
                            id="our-story-title"
                            value={value.title || ''}
                            onChange={(event) => onChangeField('title', event.target.value)}
                            placeholder="Heritage, Refined."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="our-story-description">Description</Label>
                        <textarea
                            id="our-story-description"
                            value={value.description || ''}
                            onChange={(event) => onChangeField('description', event.target.value)}
                            rows={5}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Write your story description"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                            <span>Show image section</span>
                            <input
                                type="checkbox"
                                checked={Boolean(value.show_image)}
                                onChange={(event) => onChangeField('show_image', event.target.checked)}
                            />
                        </label>

                        <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                            <span>Show text section</span>
                            <input
                                type="checkbox"
                                checked={Boolean(value.show_text)}
                                onChange={(event) => onChangeField('show_text', event.target.checked)}
                            />
                        </label>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="our-story-background" className="flex items-center gap-2">
                            <Palette className="size-4" />
                            Background color
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="our-story-background"
                                type="color"
                                value={value.background_color || '#c8b89a'}
                                onChange={(event) =>
                                    onChangeField('background_color', event.target.value)
                                }
                                className="h-10 w-16 p-1"
                            />
                            <Input
                                value={value.background_color || '#c8b89a'}
                                onChange={(event) =>
                                    onChangeField('background_color', event.target.value)
                                }
                                placeholder="#c8b89a"
                            />
                        </div>
                    </div>
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
