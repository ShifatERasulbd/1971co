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

export default function ProductForm({
    form = {},
    errors = {},
    isSubmitting = false,
    onChange,
    onSubmit,
    onCancel,
    submitLabel = 'Create Product',
    submittingLabel = 'Saving...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Use this form to create or update a product in inventory.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="product-name">
                                        Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-name"
                                        name="name"
                                        value={form.name || ''}
                                        onChange={onChange}
                                        placeholder="e.g. Classic Cotton Tee"
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-sku">
                                        SKU <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-sku"
                                        name="sku"
                                        value={form.sku || ''}
                                        onChange={onChange}
                                        placeholder="e.g. TEE-BLK-M-1001"
                                    />
                                    {errors.sku && <p className="text-xs text-destructive">{errors.sku[0]}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-description">Description</Label>
                                <textarea
                                    id="product-description"
                                    name="description"
                                    rows={6}
                                    value={form.description || ''}
                                    onChange={onChange}
                                    placeholder="Short product description"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-cover-image">Cover Image URL</Label>
                                <Input
                                    id="product-cover-image"
                                    name="cover_image"
                                    value={form.cover_image || ''}
                                    onChange={onChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.cover_image && <p className="text-xs text-destructive">{errors.cover_image[0]}</p>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="mb-3 text-sm font-medium text-muted-foreground">Cover Preview</p>
                                {form.cover_image ? (
                                    <img
                                        src={form.cover_image}
                                        alt={form.name || 'Product cover'}
                                        className="h-64 w-full rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-64 items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
                                        Add a cover image URL to preview it here
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="product-color">Color</Label>
                                    <Input
                                        id="product-color"
                                        name="color"
                                        value={form.color || ''}
                                        onChange={onChange}
                                        placeholder="e.g. Black"
                                    />
                                    {errors.color && <p className="text-xs text-destructive">{errors.color[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-size">Size</Label>
                                    <Input
                                        id="product-size"
                                        name="size"
                                        value={form.size || ''}
                                        onChange={onChange}
                                        placeholder="e.g. M"
                                    />
                                    {errors.size && <p className="text-xs text-destructive">{errors.size[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-stock">
                                        Stock <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={form.stock ?? ''}
                                        onChange={onChange}
                                        placeholder="0"
                                    />
                                    {errors.stock && <p className="text-xs text-destructive">{errors.stock[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="product-price">
                                        Price <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="product-price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price ?? ''}
                                        onChange={onChange}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-xs text-destructive">{errors.price[0]}</p>}
                                </div>
                            </div>
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
