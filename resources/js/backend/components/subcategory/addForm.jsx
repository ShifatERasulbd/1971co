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
	subCategory = null,
	previews = {},
	onFileChange,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	submitLabel = 'Create SubCategory',
	submittingLabel = 'Saving...',
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>SubCategory Details</CardTitle>
				<CardDescription>Fill in the details for the subcategory.</CardDescription>
			</CardHeader>
			<Separator />

			<form onSubmit={onSubmit}>
				<CardContent className="space-y-6 pt-6">
					<div className="space-y-2">
						<Label htmlFor="subcategory-name">
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="subcategory-name"
							name="name"
							value={form.name || ''}
							onChange={onChange}
							placeholder="e.g. Men's Wear"
						/>
						{errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subcategory-slug">
							Slug <span className="text-destructive">*</span>
						</Label>
						<Input
							id="subcategory-slug"
							name="slug"
							value={form.slug || ''}
							onChange={onChange}
							placeholder="e.g. mens-wear"
						/>
						{errors.slug && <p className="text-xs text-destructive">{errors.slug[0]}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="subcategory-category-id">
							Category <span className="text-destructive">*</span>
						</Label>
						<select
							id="subcategory-category-id"
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
						<Label htmlFor="subcategory-image">
							Image <span className="text-xs font-normal text-muted-foreground">(optional)</span>
						</Label>
						<Input
							id="subcategory-image"
							name="image"
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							onChange={onFileChange}
						/>
						{previews?.image && (
							<div className="mt-3 overflow-hidden rounded border bg-muted p-2">
								<img
									src={previews.image}
									alt="Subcategory preview"
									className="max-h-[28rem] w-auto max-w-full rounded object-contain"
								/>
							</div>
						)}
						{subCategory?.image_url && !previews?.image && (
							<div className="mt-3 overflow-hidden rounded border bg-muted p-2">
								<img
									src={subCategory.image_url}
									alt={subCategory.name || 'Current subcategory image'}
									className="max-h-[28rem] w-auto max-w-full rounded object-contain"
								/>
							</div>
						)}
						{errors.image && <p className="text-xs text-destructive">{errors.image[0]}</p>}
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
