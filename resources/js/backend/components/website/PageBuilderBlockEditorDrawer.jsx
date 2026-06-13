import { Type } from 'lucide-react';

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

const fontOptions = [
    'Arial, sans-serif',
    'Georgia, serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Courier New, monospace',
    'Times New Roman, serif',
];

const alignOptions = ['left', 'center', 'right'];

export default function PageBuilderBlockEditorDrawer({
    open,
    onOpenChange,
    block,
    onChangeField,
    onUploadFile,
}) {
    const isTextSingle = block?.type === 'text-single';
    const isTextDouble = block?.type === 'text-double';
    const isImage = block?.type === 'image';
    const isVideo = block?.type === 'video';
    const isText = isTextSingle || isTextDouble;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[470px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Type className="size-4" />
                        Component Editor
                    </SheetTitle>
                    <SheetDescription>
                        Control text, fonts, size, media source, and visual alignment for the selected block.
                    </SheetDescription>
                </SheetHeader>

                {!block ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">Select a block to start editing.</div>
                ) : (
                    <div className="space-y-5 px-4 pb-6">
                        {isTextSingle ? (
                            <div className="space-y-2">
                                <Label htmlFor="builder-text">Text</Label>
                                <Input
                                    id="builder-text"
                                    value={block.text}
                                    onChange={(event) => onChangeField('text', event.target.value)}
                                />
                            </div>
                        ) : null}

                        {isTextDouble ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="builder-line-one">Line one</Label>
                                    <Input
                                        id="builder-line-one"
                                        value={block.lineOne}
                                        onChange={(event) => onChangeField('lineOne', event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="builder-line-two">Line two</Label>
                                    <Input
                                        id="builder-line-two"
                                        value={block.lineTwo}
                                        onChange={(event) => onChangeField('lineTwo', event.target.value)}
                                    />
                                </div>
                            </>
                        ) : null}

                        {isText ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="builder-font-size">Text size (px)</Label>
                                    <Input
                                        id="builder-font-size"
                                        type="number"
                                        min={12}
                                        max={120}
                                        value={block.fontSize}
                                        onChange={(event) => onChangeField('fontSize', Number(event.target.value) || 12)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-font-family">Font family</Label>
                                    <select
                                        id="builder-font-family"
                                        value={block.fontFamily}
                                        onChange={(event) => onChangeField('fontFamily', event.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {fontOptions.map((font) => (
                                            <option key={font} value={font}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-font-weight">Font weight</Label>
                                    <Input
                                        id="builder-font-weight"
                                        type="number"
                                        min={300}
                                        max={900}
                                        step={100}
                                        value={block.fontWeight}
                                        onChange={(event) => onChangeField('fontWeight', Number(event.target.value) || 400)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-text-color">Text color</Label>
                                    <Input
                                        id="builder-text-color"
                                        type="color"
                                        value={block.color}
                                        onChange={(event) => onChangeField('color', event.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-align">Alignment</Label>
                                    <select
                                        id="builder-align"
                                        value={block.align}
                                        onChange={(event) => onChangeField('align', event.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                                    >
                                        {alignOptions.map((option) => (
                                            <option key={option} value={option} className="capitalize">
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : null}

                        {isImage || isVideo ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="builder-media-url">{isImage ? 'Image URL' : 'Video URL'}</Label>
                                    <Input
                                        id="builder-media-url"
                                        value={block.src}
                                        onChange={(event) => onChangeField('src', event.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-media-upload">Upload {isImage ? 'image' : 'video'}</Label>
                                    <Input
                                        id="builder-media-upload"
                                        type="file"
                                        accept={isImage ? 'image/*' : 'video/*'}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                onUploadFile(file);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-media-height">Height (px)</Label>
                                    <Input
                                        id="builder-media-height"
                                        type="number"
                                        min={120}
                                        max={900}
                                        value={block.height}
                                        onChange={(event) => onChangeField('height', Number(event.target.value) || 120)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="builder-media-position">Object position</Label>
                                    <Input
                                        id="builder-media-position"
                                        value={block.objectPosition}
                                        onChange={(event) => onChangeField('objectPosition', event.target.value)}
                                        placeholder="center"
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                <SheetFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium"
                    >
                        Close Editor
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
