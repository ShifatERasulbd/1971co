import { useMemo, useState } from 'react';
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

const tabs = [
    { key: 'logos', label: 'Logos' },
    { key: 'social', label: 'Social Media' },
    { key: 'contact', label: 'Contact & Currency' },
    { key: 'frontend-utils', label: 'Frontend Utils' },
];

function previewFor(file) {
    return file instanceof File ? URL.createObjectURL(file) : '';
}

export default function SettingsForm({
    form,
    errors = {},
    isSubmitting = false,
    headerLogoPreview = '',
    footerLogoPreview = '',
    shopMenuImagePreview = '',
    socialIconPreviews = {},
    onChange,
    onHeaderLogoChange,
    onFooterLogoChange,
    onShopMenuImageChange,
    onSocialChange,
    onSocialIconChange,
    onAddSocial,
    onRemoveSocial,
    onFrontendUtilsChange,
    onSubmit,
    onCancel,
    submitLabel = 'Save Settings',
    submittingLabel = 'Saving...',
}) {
    const [activeTab, setActiveTab] = useState('logos');

    const socialItems = useMemo(
        () => (Array.isArray(form.social_media) ? form.social_media : []),
        [form.social_media],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage logos, social links, and contact details.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.key}
                                type="button"
                                variant={activeTab === tab.key ? 'default' : 'outline'}
                                onClick={() => setActiveTab(tab.key)}
                                disabled={isSubmitting}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {activeTab === 'logos' && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="header-logo">Header Logo</Label>
                                <Input
                                    id="header-logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml"
                                    onChange={onHeaderLogoChange}
                                    disabled={isSubmitting}
                                />
                                {(headerLogoPreview || form.header_logo) && (
                                    <img
                                        src={headerLogoPreview || form.header_logo}
                                        alt="Header logo"
                                        className="h-24 w-full rounded border bg-muted object-contain"
                                    />
                                )}
                                {errors.header_logo && <p className="text-xs text-destructive">{errors.header_logo[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="footer-logo">Footer Logo</Label>
                                <Input
                                    id="footer-logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml"
                                    onChange={onFooterLogoChange}
                                    disabled={isSubmitting}
                                />
                                {(footerLogoPreview || form.footer_logo) && (
                                    <img
                                        src={footerLogoPreview || form.footer_logo}
                                        alt="Footer logo"
                                        className="h-24 w-full rounded border bg-muted object-contain"
                                    />
                                )}
                                {errors.footer_logo && <p className="text-xs text-destructive">{errors.footer_logo[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shop-menu-image">Shop Mega Menu Image</Label>
                                <Input
                                    id="shop-menu-image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                                    onChange={onShopMenuImageChange}
                                    disabled={isSubmitting}
                                />
                                {(shopMenuImagePreview || form.shop_menu_image) && (
                                    <img
                                        src={shopMenuImagePreview || form.shop_menu_image}
                                        alt="Shop mega menu image"
                                        className="h-24 w-full rounded border bg-muted object-cover"
                                    />
                                )}
                                {errors.shop_menu_image && <p className="text-xs text-destructive">{errors.shop_menu_image[0]}</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Social Media Repeater</h3>
                                <Button type="button" variant="outline" size="sm" onClick={onAddSocial} disabled={isSubmitting}>
                                    Add Social
                                </Button>
                            </div>

                            {socialItems.length === 0 && (
                                <p className="text-sm text-muted-foreground">No social media items yet.</p>
                            )}

                            <div className="space-y-3">
                                {socialItems.map((item, index) => {
                                    const localPreview = socialIconPreviews[index];
                                    const iconPreview = localPreview || item.icon || '';

                                    return (
                                        <div key={`social-${index}`} className="rounded-md border p-3 space-y-3">
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={item.name || ''}
                                                        onChange={(event) => onSocialChange(index, 'name', event.target.value)}
                                                        placeholder="e.g. Facebook"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Link</Label>
                                                    <Input
                                                        value={item.link || ''}
                                                        onChange={(event) => onSocialChange(index, 'link', event.target.value)}
                                                        placeholder="https://..."
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                                <div className="space-y-2 md:w-full">
                                                    <Label>Icon Image</Label>
                                                    <Input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml"
                                                        onChange={(event) => onSocialIconChange(index, event.target.files?.[0] || null)}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => onRemoveSocial(index)}
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            {iconPreview && (
                                                <img
                                                    src={iconPreview}
                                                    alt={`${item.name || 'Social'} icon`}
                                                    className="h-16 w-16 rounded border bg-muted object-contain"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.social_media && <p className="text-xs text-destructive">{errors.social_media[0]}</p>}
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="settings-email">Email Address</Label>
                                <Input
                                    id="settings-email"
                                    name="email"
                                    value={form.email || ''}
                                    onChange={onChange}
                                    placeholder="support@example.com"
                                    disabled={isSubmitting}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="settings-currency">Currency</Label>
                                <Input
                                    id="settings-currency"
                                    name="currency"
                                    value={form.currency || ''}
                                    onChange={onChange}
                                    placeholder="USD"
                                    disabled={isSubmitting}
                                />
                                {errors.currency && <p className="text-xs text-destructive">{errors.currency[0]}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="settings-location">Location</Label>
                                <textarea
                                    id="settings-location"
                                    name="location"
                                    value={form.location || ''}
                                    onChange={onChange}
                                    placeholder="Company address"
                                    rows={4}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                    disabled={isSubmitting}
                                />
                                {errors.location && <p className="text-xs text-destructive">{errors.location[0]}</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'frontend-utils' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="frontend-timeless-font">Timeless Font Family</Label>
                                    <Input
                                        id="frontend-timeless-font"
                                        value={form.frontend_utils?.timeless_font_family || ''}
                                        onChange={(event) => onFrontendUtilsChange?.('timeless_font_family', event.target.value)}
                                        placeholder='e.g. "Bebas Neue"'
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frontend-features-font">Features Font Family</Label>
                                    <Input
                                        id="frontend-features-font"
                                        value={form.frontend_utils?.features_font_family || ''}
                                        onChange={(event) => onFrontendUtilsChange?.('features_font_family', event.target.value)}
                                        placeholder='e.g. "Inter", ui-sans-serif, system-ui, sans-serif'
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="frontend-hero-default-font">Hero Default Font Key</Label>
                                    <Input
                                        id="frontend-hero-default-font"
                                        value={form.frontend_utils?.hero_default_font_family || ''}
                                        onChange={(event) => onFrontendUtilsChange?.('hero_default_font_family', event.target.value)}
                                        placeholder="e.g. instrument-sans"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="frontend-hero-options">Hero Font Options (JSON)</Label>
                                    <textarea
                                        id="frontend-hero-options"
                                        value={form.frontend_utils?.hero_font_family_options_json || '[]'}
                                        onChange={(event) => onFrontendUtilsChange?.('hero_font_family_options_json', event.target.value)}
                                        placeholder='[{"label":"Bebas Neue","value":"Bebas Neue"}]'
                                        rows={5}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="frontend-hero-css-map">Hero Font CSS Map (JSON)</Label>
                                    <textarea
                                        id="frontend-hero-css-map"
                                        value={form.frontend_utils?.hero_font_family_css_map_json || '{}'}
                                        onChange={(event) => onFrontendUtilsChange?.('hero_font_family_css_map_json', event.target.value)}
                                        placeholder='{"Bebas Neue":"\"Bebas Neue\""}'
                                        rows={6}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
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
