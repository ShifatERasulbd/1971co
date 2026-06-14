import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Size</CardTitle>
                <CardDescription>Update Size information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Input
                                id="size"
                                name="size"
                                value={form.size}
                                onChange={onChange}
                                placeholder="e.g. XL"
                                maxLength={20}
                                required
                            />
                            {errors.size && <p className="text-xs text-destructive">{errors.size[0]}</p>}
                        </div>

                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Size'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}