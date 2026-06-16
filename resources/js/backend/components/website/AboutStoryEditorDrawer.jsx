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
import { RichTextEditor } from '@/components/ui/rich-text-editor.jsx';

export default function AboutStoryEditorDrawer({
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
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[460px] lg:max-w-[520px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        1971 Story Editor
                    </SheetTitle>
                    <SheetDescription>
                        Update the section title, story title, description, and supporting image.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2" htmlFor="about-story-image-upload">
                            <ImageIcon className="size-4" />
                            Story image
                        </Label>
                        <Input
                            id="about-story-image-upload"
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
                                alt="1971 story background preview"
                                className="h-44 w-full rounded-md border border-border object-cover"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-story-section-title" className="flex items-center gap-2">
                            <Type className="size-4" />
                            Subtitle
                        </Label>
                        <Input
                            id="about-story-section-title"
                            value={value.section_title || ''}
                            onChange={(event) => onChangeField('section_title', event.target.value)}
                            placeholder="The Beginning"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="about-story-title">Title</Label>
                        <Input
                            id="about-story-title"
                            value={value.title || ''}
                            onChange={(event) => onChangeField('title', event.target.value)}
                            placeholder="Why 1971?"
                        />
                    </div>

                    <div className="space-y-2">
                        <RichTextEditor
                            value={value.description_html || ''}
                            onChange={(html) => onChangeField('description_html', html)}
                            label="Description"
                            placeholder="Write the 1971 story..."
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={isSaving}>
                        {isSaving ? 'Saving Story...' : 'Save To Database'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
