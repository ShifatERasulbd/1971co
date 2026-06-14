import { Star } from 'lucide-react';

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

export default function BestSellersEditorDrawer({
    open,
    onOpenChange,
    activeItemIndex,
    sectionTitle = 'Best Sellers',
    sectionPosition = 3,
    onChangeTitle,
    onChangePosition,
    onSave,
    isSaving = false,
}) {
    const hasActiveItem = Number.isInteger(activeItemIndex) && activeItemIndex >= 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="h-screen w-full overflow-y-auto sm:max-w-[430px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Star className="size-4" />
                        Best Sellers Section
                    </SheetTitle>
                    <SheetDescription>
                        Products are shown directly inside the Best Sellers section preview. This drawer keeps title and section order context.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <Label htmlFor="best-sellers-title">Section Title</Label>
                            <Input
                                id="best-sellers-title"
                                value={sectionTitle}
                                onChange={(event) => onChangeTitle?.(event.target.value)}
                                placeholder="Best Sellers"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="best-sellers-position">Section Position</Label>
                            <Input
                                id="best-sellers-position"
                                type="number"
                                min={1}
                                max={6}
                                value={String(sectionPosition)}
                                onChange={(event) => onChangePosition?.(event.target.value)}
                            />
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {hasActiveItem
                            ? `Selected product card ${activeItemIndex + 1} in preview.`
                            : 'Click a product card in preview to focus it here.'}
                    </p>
                </div>

                <SheetFooter>
                    <Button type="button" onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save To Database'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
