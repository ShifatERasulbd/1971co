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
import { ExternalLink } from 'lucide-react';

export default function AddForm({
	form = {},
	onChange,
	onFileChange,
	onSubmit,
	onCancel,
	feature = null,
	previews = {},
	isSubmitting = false,
	errors = {},
	submitLabel = 'Create Feature',
	submittingLabel = 'Saving...',
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Feature Details</CardTitle>
				<CardDescription>Fill in the details used in the website feature section.</CardDescription>
			</CardHeader>
			<Separator />

			<form onSubmit={onSubmit}>
				<CardContent className="space-y-6 pt-6">
					<div className="space-y-2">
						<Label htmlFor="feature-title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="feature-title"
							name="title"
							value={form.title || ''}
							onChange={onChange}
							placeholder="e.g. Premium Quality"
						/>
						{errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="feature-description">
							Description <span className="text-destructive">*</span>
						</Label>
						<textarea
							id="feature-description"
							name="description"
							value={form.description || ''}
							onChange={onChange}
							placeholder="e.g. Crafted with care for everyday style."
							rows={4}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
						/>
						{errors.description && <p className="text-xs text-destructive">{errors.description[0]}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="feature-icon">
							Icon <span className="text-xs font-normal text-muted-foreground">(optional)</span>
						</Label>
						<Input
							id="feature-icon"
							name="icon"
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							onChange={onFileChange}
						/>
						{previews?.icon && (
							<div className="mt-3">
								<img
									src={previews.icon}
									alt="Icon preview"
									className="h-40 w-full rounded border bg-muted object-contain"
								/>
							</div>
						)}
						{feature?.icon_url && !previews?.icon && (
							<div className="mt-3 space-y-2">
								<img
									src={feature.icon_url}
									alt={`${feature?.title || 'Feature'} icon`}
									className="h-24 w-24 rounded-md border bg-muted object-cover"
								/>
								<a
									href={feature.icon_url}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 text-xs text-blue-600 underline"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View current icon
								</a>
							</div>
						)}
						{errors.icon && <p className="text-xs text-destructive">{errors.icon[0]}</p>}
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
 