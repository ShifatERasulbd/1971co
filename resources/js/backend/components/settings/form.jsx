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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const presetSocialIcons = [
    { key: 'facebook', label: 'Facebook', path: '/icons/social/facebook.svg' },
    { key: 'instagram', label: 'Instagram', path: '/icons/social/instagram.svg' },
    { key: 'tiktok', label: 'TikTok', path: '/icons/social/tiktok.svg' },
];

const tabs = [
    { key: 'logos', label: 'Logos' },
    { key: 'social', label: 'Social Media' },
    { key: 'contact', label: 'Contact & Currency' },
    { key: 'analytics', label: 'Analytics' },
  
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
    faviconPreview = '',
    shopMenuImagePreview = '',
    socialIconPreviews = {},
    onChange,

    
    onHeaderLogoChange,
    onFooterLogoChange,
    onFaviconChange,
    onShopMenuImageChange,
    onSocialChange,
    onSocialIconChange,
    onAddSocial,
    onRemoveSocial,
   
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
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
                                <Label htmlFor="settings-favicon">Favicon</Label>
                                <Input
                                    id="settings-favicon"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml,image/x-icon,.ico"
                                    onChange={onFaviconChange}
                                    disabled={isSubmitting}
                                />
                                {(faviconPreview || form.favicon) && (
                                    <img
                                        src={faviconPreview || form.favicon}
                                        alt="Favicon"
                                        className="h-24 w-full rounded border bg-muted object-contain"
                                    />
                                )}
                                {errors.favicon && <p className="text-xs text-destructive">{errors.favicon[0]}</p>}
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
                                    const selectedPreset = presetSocialIcons.find((preset) => preset.path === item.icon)?.key || '';

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
                                                {iconPreview ? (
                                                    <img
                                                        src={iconPreview}
                                                        alt={`${item.name || 'Social'} icon`}
                                                        className="h-10 w-10 shrink-0 rounded border bg-muted object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted text-[10px] text-muted-foreground">
                                                        No icon
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label>Default Icon</Label>
                                                    <Select
                                                        value={selectedPreset}
                                                        onValueChange={(value) => {
                                                            const preset = presetSocialIcons.find((option) => option.key === value);
                                                            if (!preset) return;
                                                            onSocialIconChange(index, null);
                                                            onSocialChange(index, 'icon', preset.path);
                                                        }}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger className="w-[160px]">
                                                            <SelectValue placeholder="Choose icon" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {presetSocialIcons.map((preset) => (
                                                                <SelectItem key={preset.key} value={preset.key}>
                                                                    {preset.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2 md:w-full">
                                                    <Label>Or Upload Icon Image</Label>
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
                                <Label htmlFor="settings-phone">Phone Number</Label>
                                <Input
                                    id="settings-phone"
                                    name="contact_phone"
                                    value={form.contact_phone || ''}
                                    onChange={onChange}
                                    placeholder="(202) 123-4567"
                                    disabled={isSubmitting}
                                />
                                {errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone[0]}</p>}
                            </div>

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

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="google-analytics-id">Google Analytics Measurement ID</Label>
                                <Input
                                    id="google-analytics-id"
                                    name="google_analytics_id"
                                    value={form.google_analytics_id || ''}
                                    onChange={onChange}
                                    placeholder="G-XXXXXXXXXX"
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter your Google Analytics 4 Measurement ID to enable analytics tracking.
                                </p>
                                {errors.google_analytics_id && <p className="text-xs text-destructive">{errors.google_analytics_id[0]}</p>}
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
