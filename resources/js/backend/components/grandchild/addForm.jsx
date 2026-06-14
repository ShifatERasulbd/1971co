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

export default function AddForm({
    form = {},
    categories = [],
    subCategories = [],
    onChange,
    onSubmit,
    onCancel,
    isSubmitting = false,
    errors = {},
    submitLabel = 'Create GrandChild',
    submittingLabel = 'Saving...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>GrandChild Details</CardTitle>
                <CardDescription>Fill in the details for the grandchild entry.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="grandchild-name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="grandchild-name"
                            name="name"
                            value={form.name || ''}
                            onChange={onChange}
                            placeholder="e.g. Tops"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grandchild-slug">
                            Slug <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="grandchild-slug"
                            name="slug"
                            value={form.slug || ''}
                            onChange={onChange}
                            placeholder="e.g. tops"
                        />
                        {errors.slug && <p className="text-xs text-destructive">{errors.slug[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grandchild-category-id">
                            Category <span className="text-destructive">*</span>
                        </Label>
                        <select
                            id="grandchild-category-id"
                            name="category_id"
                            value={form.category_id || ''}
                            onChange={onChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grandchild-sub-category-id">
                            SubCategory <span className="text-destructive">*</span>
                        </Label>
                        <select
                            id="grandchild-sub-category-id"
                            name="sub_category_id"
                            value={form.sub_category_id || ''}
                            onChange={onChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Select a subcategory</option>
                            {subCategories.map((subCategory) => (
                                <option key={subCategory.id} value={subCategory.id}>
                                    {subCategory.name}
                                </option>
                            ))}
                        </select>
                        {errors.sub_category_id && <p className="text-xs text-destructive">{errors.sub_category_id[0]}</p>}
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
