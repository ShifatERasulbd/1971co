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

const sectionHints = {
    hero: 'Edit the main campaign heading and hero CTA section identity.',
    features: 'Configure the impact features panel and cards section label.',
    'community-center': 'Configure community center heading and programs section details.',
    gallery: 'Configure the community gallery label and showcase heading.',
    newsletter: 'Configure the newsletter call-to-action content area.',
};

export default function CommunitySectionEditorDrawer({
    open,
    onOpenChange,
    section,
    onChangeField,
    onSave,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[420px] lg:max-w-[460px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        Community Component Drawer
                    </SheetTitle>
                    <SheetDescription>
                        Edit selected community page component details and publish directly to preview.
                    </SheetDescription>
                </SheetHeader>

                {!section ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                        Select a component from Community Page Components to edit.
                    </div>
                ) : (
                    <div className="space-y-5 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="community-section-content-title">Content Title</Label>
                            <Input
                                id="community-section-content-title"
                                value={section.contentTitle || ''}
                                onChange={(event) => onChangeField?.('contentTitle', event.target.value)}
                                placeholder="e.g., Together We Grow"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community-section-heading">Heading</Label>
                            <textarea
                                id="community-section-heading"
                                value={section.heading || ''}
                                onChange={(event) => onChangeField?.('heading', event.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                                placeholder="Main heading text"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community-section-description">Description</Label>
                            <textarea
                                id="community-section-description"
                                value={section.sectionDescription || ''}
                                onChange={(event) => onChangeField?.('sectionDescription', event.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                                placeholder="Section description text"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community-section-status">Status</Label>
                            <select
                                id="community-section-status"
                                value={section.status || 'active'}
                                onChange={(event) => onChangeField?.('status', event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community-section-button-text">Button Text</Label>
                            <Input
                                id="community-section-button-text"
                                value={section.buttonText || ''}
                                onChange={(event) => onChangeField?.('buttonText', event.target.value)}
                                placeholder="Button label (e.g., Learn More, Subscribe)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community-section-button-url">Button URL</Label>
                            <Input
                                id="community-section-button-url"
                                value={section.buttonUrl || ''}
                                onChange={(event) => onChangeField?.('buttonUrl', event.target.value)}
                                placeholder="Button URL (e.g., /products, #gallery)"
                            />
                        </div>

                        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                            {sectionHints[section.key] || 'Use this drawer to update selected section metadata.'}
                        </div>
                    </div>
                )}

                <SheetFooter>
                    <Button onClick={() => onSave?.()} disabled={!section}>
                        Save Section
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
