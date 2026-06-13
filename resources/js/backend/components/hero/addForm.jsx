import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { heroFontFamilyOptions } from '../../../utils/heroTypography';

function resolveMediaUrl(value, fallbackDirectory) {
    if (!value) {
        return null;
    }

    const raw = String(value);

    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) {
        return raw;
    }

    const normalized = raw.replace(/^\/+/, '');

    if (normalized.startsWith('uploads/')) {
        return `/${normalized}`;
    }

    if (normalized.includes('/')) {
        return `/${normalized}`;
    }

    return `${fallbackDirectory}/${normalized}`;
}

export default function AddForm({
    form = {},
    onChange,
    onFileChange,
    onSubmit,
    onCancel,
    hero = null,
    previews = {},
    isSubmitting = false,
    errors = {},
    submitLabel = 'Create Hero',
    submittingLabel = 'Saving...',
}) {
    const currentImageSrc = resolveMediaUrl(
        hero?.image_url || hero?.image,
        '/uploads/heroes/images'
    );
    const currentVideoSrc = resolveMediaUrl(
        hero?.video_url || hero?.video,
        '/uploads/heroes/videos'
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hero Details</CardTitle>
                <CardDescription>Fill in the hero section details for the website.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {/* Title */}
                   
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-end">
                        <div className="space-y-2 md:col-span-8">
                              <Label htmlFor="hero-title">Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="hero-title"
                                name="title"
                                value={form.title || ''}
                                onChange={onChange}
                                placeholder="e.g. Welcome to our store"
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">{errors.title[0]}</p>
                            )}
                          </div>

                        <div className="md:col-span-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="hero-title-font-size">Title Font Size (px)</Label>
                                    <Input
                                        id="hero-title-font-size"
                                        name="title_font_size"
                                        type="number"
                                        min={20}
                                        max={220}
                                        value={form.title_font_size || ''}
                                        onChange={onChange}
                                        placeholder="e.g. 124"
                                    />
                                    {errors.title_font_size && (
                                        <p className="text-xs text-destructive">{errors.title_font_size[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hero-title-font-family">Title Font Family</Label>
                                    <select
                                        id="hero-title-font-family"
                                        name="title_font_family"
                                        value={form.title_font_family || 'instrument-sans'}
                                        onChange={onChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {heroFontFamilyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.title_font_family && (
                                        <p className="text-xs text-destructive">{errors.title_font_family[0]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                      
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="hero-description">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <textarea
                            id="hero-description"
                            name="description"
                            value={form.description || ''}
                            onChange={onChange}
                            placeholder="e.g. Discover our latest collection..."
                            rows={4}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">{errors.description[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    

               

                        <div className="space-y-2">
                            <Label htmlFor="hero-description-font-size">Description Font Size (px)</Label>
                            <Input
                                id="hero-description-font-size"
                                name="description_font_size"
                                type="number"
                                min={10}
                                max={100}
                                value={form.description_font_size || ''}
                                onChange={onChange}
                                placeholder="e.g. 24"
                            />
                            {errors.description_font_size && (
                                <p className="text-xs text-destructive">{errors.description_font_size[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero-description-font-family">Description Font Family</Label>
                            <select
                                id="hero-description-font-family"
                                name="description_font_family"
                                value={form.description_font_family || 'instrument-sans'}
                                onChange={onChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                {heroFontFamilyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.description_font_family && (
                                <p className="text-xs text-destructive">{errors.description_font_family[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Image */}
                        <div className="space-y-2">
                            <Label htmlFor="hero-image">
                                Image{' '}
                                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="hero-image"
                                name="image"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={onFileChange}
                            />
                            {previews?.image && (
                                <div className="mt-3">
                                    <img
                                        src={previews.image}
                                        alt="Image preview"
                                        className="h-64 w-full object-contain rounded border bg-muted"
                                    />
                                </div>
                            )}
                            {currentImageSrc && !previews?.image && (
                                <div className="mt-3 space-y-2">
                                    <img
                                        src={currentImageSrc}
                                        alt="Current image"
                                        className="h-64 w-full object-contain rounded border bg-muted"
                                    />
                                    <a
                                        href={currentImageSrc}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 underline"
                                    >
                                        View current image
                                    </a>
                                </div>
                            )}
                            {errors.image && (
                                <p className="text-xs text-destructive">{errors.image[0]}</p>
                            )}
                        </div>

                        {/* Video */}
                        <div className="space-y-2">
                            <Label htmlFor="hero-video">
                                Video{' '}
                                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="hero-video"
                                name="video"
                                type="file"
                                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                                onChange={onFileChange}
                            />
                            {previews?.video && (
                                <div className="mt-3">
                                    <video
                                        src={previews.video}
                                        className="h-64 w-full object-contain rounded border bg-muted"
                                        controls
                                    />
                                </div>
                            )}
                            {currentVideoSrc && !previews?.video && (
                                <a
                                    href={currentVideoSrc}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 underline"
                                >
                                    View current video
                                </a>
                            )}
                            {errors.video && (
                                <p className="text-xs text-destructive">{errors.video[0]}</p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
