import { Settings2 } from 'lucide-react';

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

export default function HeroEditorDrawer({
    open,
    onOpenChange,
    activePart,
    value,
    onChange,
    onUploadImage,
    onUploadVideo,
    onSave,
    isSaving,
}) {
    const showAll = !activePart || activePart === 'all';
    const showTitle = showAll || activePart === 'title';
    const showDescription = showAll || activePart === 'description';
    const showButton = showAll || activePart === 'button';
        const activePartLabel =
                activePart === 'title'
                        ? 'Title'
                        : activePart === 'description'
                            ? 'Description'
                            : activePart === 'button'
                                ? 'Button'
                                : 'All';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[380px] lg:max-w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Hero Component Editor
                    </SheetTitle>
                    <div>
                        <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            Editing: {activePartLabel}
                        </span>
                    </div>
                    <SheetDescription>
                        {activePart === 'title'
                            ? 'Title settings'
                            : activePart === 'description'
                              ? 'Description settings'
                              : activePart === 'button'
                                ? 'Button settings'
                                : 'Update hero image, title, and description. Changes are reflected live in the page preview.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                    {showTitle ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-title-mode">Title line mode</Label>
                        <select
                            id="hero-title-mode"
                            value={value.title_display_mode || 'double'}
                            onChange={(event) => onChange('title_display_mode', event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="single">Single line</option>
                            <option value="double">Double line</option>
                        </select>
                    </div>
                    ) : null}

                    {showAll ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-image-upload">Upload image</Label>
                        <Input
                            id="hero-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadImage?.(file);
                                }
                            }}
                        />

                        {value.image_url ? (
                            <div className="overflow-hidden rounded-md border border-border bg-muted/20">
                                <img
                                    src={value.image_url}
                                    alt="Uploaded hero preview"
                                    className="h-40 w-full object-cover"
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Upload an image to preview it here.
                            </p>
                        )}
                    </div>
                    ) : null}

                    {showAll ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-video">Hero video URL</Label>
                        <Input
                            id="hero-video"
                            value={value.video_url || ''}
                            onChange={(event) => onChange('video_url', event.target.value)}
                            placeholder="https://example.com/hero-video.mp4"
                        />
                    </div>
                    ) : null}

                    {showAll ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-video-upload">Upload video</Label>
                        <Input
                            id="hero-video-upload"
                            type="file"
                            accept="video/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onUploadVideo?.(file);
                                }
                            }}
                        />
                    </div>
                    ) : null}

                    {showTitle ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-title">Hero title</Label>
                        <Input
                            id="hero-title"
                            value={value.title}
                            onChange={(event) => onChange('title', event.target.value)}
                            placeholder="Custom apparel solutions"
                        />
                    </div>
                    ) : null}

                    {showTitle ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-title-size">Title size</Label>
                        <Input
                            id="hero-title-size"
                            type="number"
                            min={32}
                            max={180}
                            value={value.title_font_size || 124}
                            onChange={(event) => onChange('title_font_size', Number(event.target.value) || 124)}
                        />
                    </div>
                    ) : null}

                    {showTitle ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-title-font">Title font family</Label>
                        <select
                            id="hero-title-font"
                            value={value.title_font_family || 'instrument-sans'}
                            onChange={(event) => onChange('title_font_family', event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="instrument-sans">Instrument Sans</option>
                            <option value="sora">Sora</option>
                            <option value="manrope">Manrope</option>
                            <option value="inter">Inter</option>
                            <option value="playfair-display">Playfair Display</option>
                        </select>
                    </div>
                    ) : null}

                    {showDescription ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-description">Hero description</Label>
                        <textarea
                            id="hero-description"
                            value={value.description}
                            onChange={(event) => onChange('description', event.target.value)}
                            rows={6}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Elevate your brand with premium customized apparel..."
                        />
                    </div>
                    ) : null}

                    {showDescription ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-description-size">Description size</Label>
                        <Input
                            id="hero-description-size"
                            type="number"
                            min={12}
                            max={64}
                            value={value.description_font_size || 24}
                            onChange={(event) =>
                                onChange('description_font_size', Number(event.target.value) || 24)
                            }
                        />
                    </div>
                    ) : null}

                    {showDescription ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-description-font">Description font family</Label>
                        <select
                            id="hero-description-font"
                            value={value.description_font_family || 'instrument-sans'}
                            onChange={(event) => onChange('description_font_family', event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="instrument-sans">Instrument Sans</option>
                            <option value="sora">Sora</option>
                            <option value="manrope">Manrope</option>
                            <option value="inter">Inter</option>
                            <option value="playfair-display">Playfair Display</option>
                        </select>
                    </div>
                    ) : null}

                    {showAll ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="hero-offset-x">Text X position</Label>
                            <Input
                                id="hero-offset-x"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.text_offset_x || 0}
                                onChange={(event) => onChange('text_offset_x', Number(event.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-offset-y">Text Y position</Label>
                            <Input
                                id="hero-offset-y"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.text_offset_y || 0}
                                onChange={(event) => onChange('text_offset_y', Number(event.target.value) || 0)}
                            />
                        </div>
                    </div>
                    ) : null}

                    {showTitle ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="hero-title-offset-x">Title X position</Label>
                            <Input
                                id="hero-title-offset-x"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.title_offset_x || 0}
                                onChange={(event) => onChange('title_offset_x', Number(event.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-title-offset-y">Title Y position</Label>
                            <Input
                                id="hero-title-offset-y"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.title_offset_y || 0}
                                onChange={(event) => onChange('title_offset_y', Number(event.target.value) || 0)}
                            />
                        </div>
                    </div>
                    ) : null}

                    {showDescription ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="hero-description-offset-x">Description X position</Label>
                            <Input
                                id="hero-description-offset-x"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.description_offset_x || 0}
                                onChange={(event) =>
                                    onChange('description_offset_x', Number(event.target.value) || 0)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-description-offset-y">Description Y position</Label>
                            <Input
                                id="hero-description-offset-y"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.description_offset_y || 0}
                                onChange={(event) =>
                                    onChange('description_offset_y', Number(event.target.value) || 0)
                                }
                            />
                        </div>
                    </div>
                    ) : null}

                    {showButton ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-button-enabled">Show button</Label>
                        <label
                            htmlFor="hero-button-enabled"
                            className="inline-flex cursor-pointer items-center gap-2"
                        >
                            <input
                                id="hero-button-enabled"
                                type="checkbox"
                                checked={Boolean(value.button_enabled ?? true)}
                                onChange={(event) => onChange('button_enabled', event.target.checked)}
                                className="size-4 rounded border-input"
                            />
                            <span className="text-sm text-muted-foreground">
                                {Boolean(value.button_enabled ?? true) ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                    ) : null}

                    {showButton ? (
                    <div className="space-y-2">
                        <Label htmlFor="hero-button-url">Button redirect URL</Label>
                        <Input
                            id="hero-button-url"
                            value={value.button_url || '/shop'}
                            onChange={(event) => onChange('button_url', event.target.value)}
                            placeholder="/shop"
                        />
                    </div>
                    ) : null}

                    {showButton ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="hero-button-offset-x">Button X position</Label>
                            <Input
                                id="hero-button-offset-x"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.button_offset_x || 0}
                                onChange={(event) => onChange('button_offset_x', Number(event.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-button-offset-y">Button Y position</Label>
                            <Input
                                id="hero-button-offset-y"
                                type="number"
                                min={-60}
                                max={60}
                                value={value.button_offset_y || 0}
                                onChange={(event) => onChange('button_offset_y', Number(event.target.value) || 0)}
                            />
                        </div>
                    </div>
                    ) : null}
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
