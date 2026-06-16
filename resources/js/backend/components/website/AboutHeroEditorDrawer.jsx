import { Image as ImageIcon, Settings2, Type } from 'lucide-react';

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

export default function AboutHeroEditorDrawer({
    open,
    onOpenChange,
    value,
    onChangeField,
    onUploadImage,
    onSave,
    isSaving,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[420px] lg:max-w-[460px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        About Hero Editor
                    </SheetTitle>
                    <SheetDescription>
                        Update the background image, section title, headline, and description.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2" htmlFor="about-hero-image-upload">
                            <ImageIcon className="size-4" />
                            Background image
                        </Label>
                        <Input
                            id="about-hero-image-upload"
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
                                alt="About hero background preview"
                                className="h-44 w-full rounded-md border border-border object-cover"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-hero-section-title" className="flex items-center gap-2">
                            <Type className="size-4" />
                            Section title
                        </Label>
                        <Input
                            id="about-hero-section-title"
                            value={value.section_title || ''}
                            onChange={(event) => onChangeField('section_title', event.target.value)}
                            placeholder="Our Story"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-hero-title">Title</Label>
                        <Input
                            id="about-hero-title"
                            value={value.title || ''}
                            onChange={(event) => onChangeField('title', event.target.value)}
                            placeholder="Heritage. Culture. Style."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-hero-description">Description</Label>
                        <textarea
                            id="about-hero-description"
                            value={value.description || ''}
                            onChange={(event) => onChangeField('description', event.target.value)}
                            rows={6}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                            placeholder="Redefining streetwear through bold design and authentic self-expression."
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={isSaving}>
                        {isSaving ? 'Saving Hero...' : 'Save To Database'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
