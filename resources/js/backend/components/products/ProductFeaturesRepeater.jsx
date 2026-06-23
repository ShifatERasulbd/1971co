import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productFeatureIconOptions, resolveProductFeatureIcon } from '../../../shared/productFeatureIcons';

const DEFAULT_FEATURE_ICON = 'sparkles';

function normalizeFeatures(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            icon: String(item.icon || DEFAULT_FEATURE_ICON).trim() || DEFAULT_FEATURE_ICON,
            text: String(item.text || '').trim(),
        }));
}

function getFeatureError(errors, index, field) {
    const key = `product_features.${index}.${field}`;
    const errorValue = errors?.[key];
    return Array.isArray(errorValue) ? errorValue[0] : '';
}

export default function ProductFeaturesRepeater({
    value = [],
    errors = {},
    onChange,
    disabled = false,
}) {
    const features = normalizeFeatures(value);

    const updateFeatures = (nextFeatures) => {
        onChange?.({
            target: {
                name: 'product_features',
                value: nextFeatures,
            },
        });
    };

    const handleAddFeature = () => {
        updateFeatures([
            ...features,
            { icon: DEFAULT_FEATURE_ICON, text: '' },
        ]);
    };

    const handleRemoveFeature = (indexToRemove) => {
        updateFeatures(features.filter((_, index) => index !== indexToRemove));
    };

    const handleFeatureChange = (index, field, nextValue) => {
        updateFeatures(
            features.map((feature, currentIndex) => {
                if (currentIndex !== index) {
                    return feature;
                }

                return {
                    ...feature,
                    [field]: nextValue,
                };
            }),
        );
    };

    return (
        <div className="space-y-3 rounded-md border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <Label className="text-sm font-semibold text-foreground">Product Features</Label>
                    <p className="text-xs text-muted-foreground">Add feature icon and text. Saved as JSON.</p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddFeature}
                    disabled={disabled}
                    className="gap-1"
                >
                    <Plus className="size-3.5" />
                    Add Feature
                </Button>
            </div>

            {Array.isArray(errors?.product_features) ? (
                <p className="text-xs text-destructive">{errors.product_features[0]}</p>
            ) : null}

            {features.length === 0 ? (
                <div className="rounded border border-dashed p-4 text-xs text-muted-foreground">
                    No features added yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {features.map((feature, index) => {
                        const IconComponent = resolveProductFeatureIcon(feature.icon);
                        const iconError = getFeatureError(errors, index, 'icon');
                        const textError = getFeatureError(errors, index, 'text');

                        return (
                            <div key={`${feature.icon}-${index}`} className="grid grid-cols-1 gap-3 rounded border bg-background p-3 md:grid-cols-[220px,1fr,auto] md:items-start">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Icon</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded border bg-muted/40">
                                            <IconComponent className="size-4" />
                                        </div>
                                        <select
                                            value={feature.icon}
                                            onChange={(event) => handleFeatureChange(index, 'icon', event.target.value)}
                                            disabled={disabled}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            {productFeatureIconOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {iconError ? <p className="text-xs text-destructive">{iconError}</p> : null}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Feature Text</Label>
                                    <Input
                                        value={feature.text}
                                        onChange={(event) => handleFeatureChange(index, 'text', event.target.value)}
                                        disabled={disabled}
                                        placeholder="Ex: Moisture-wicking fabric"
                                    />
                                    {textError ? <p className="text-xs text-destructive">{textError}</p> : null}
                                </div>

                                <div className="pt-0 md:pt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFeature(index)}
                                        disabled={disabled}
                                        className="text-destructive hover:text-destructive"
                                        aria-label={`Remove feature ${index + 1}`}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
