import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/components/products/richTextEditor';

export default function ComplianceForm({
    form = {},
    onChange,
    onRichTextChange,
    onSubmit,
    onCancel,
    isSubmitting = false,
    errors = {},
    submitLabel = 'Save Compliance',
    submittingLabel = 'Saving...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{submitLabel}</CardTitle>
                <CardDescription>Manage terms and conditions, privacy policy, and shipping & return information.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={form.title || ''}
                                onChange={onChange}
                                placeholder="e.g. Compliance Policies"
                                maxLength={255}
                                required
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
                        </div>

                        <RichTextEditor
                            label="Terms and Conditions"
                            value={form.terms_and_conditions || ''}
                            onChange={(html) => onRichTextChange('terms_and_conditions', html)}
                            placeholder="Enter terms and conditions content here..."
                            error={errors.terms_and_conditions}
                        />

                        <RichTextEditor
                            label="Privacy Policy"
                            value={form.privacy_policy || ''}
                            onChange={(html) => onRichTextChange('privacy_policy', html)}
                            placeholder="Enter privacy policy content here..."
                            error={errors.privacy_policy}
                        />

                        <RichTextEditor
                            label="Shipping and Return"
                            value={form.shipping_and_return || ''}
                            onChange={(html) => onRichTextChange('shipping_and_return', html)}
                            placeholder="Enter shipping and return policy here..."
                            error={errors.shipping_and_return}
                        />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
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