import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AddForm({
	form = {},
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	submitLabel = 'Create Category',
	submittingLabel = 'Saving...',
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Category Details</CardTitle>
				<CardDescription>Fill in the details for the category.</CardDescription>
			</CardHeader>
			<Separator />

			<form onSubmit={onSubmit}>
				<CardContent className="space-y-6 pt-6">
					<div className="space-y-2">
						<Label htmlFor="category-name">
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="category-name"
							name="name"
							value={form.name || ''}
							onChange={onChange}
							placeholder="e.g. Men's Wear"
						/>
						{errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="category-slug">
							Slug <span className="text-destructive">*</span>
						</Label>
						<Input
							id="category-slug"
							name="slug"
							value={form.slug || ''}
							onChange={onChange}
							placeholder="e.g. mens-wear"
						/>
						{errors.slug && <p className="text-xs text-destructive">{errors.slug[0]}</p>}
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="show-homepage"
							name="show_homepage"
							checked={Boolean(form.show_homepage)}
							onCheckedChange={(checked) =>
								onChange({
									target: {
										name: 'show_homepage',
										type: 'checkbox',
										checked: checked === true,
										value: checked === true,
									},
								})
							}
						/>
						<Label htmlFor="show-homepage">
							Show on Home Page
						</Label>
					</div>
				</CardContent>


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
