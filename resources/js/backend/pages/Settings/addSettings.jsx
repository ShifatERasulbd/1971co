import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import SettingsForm from '@/components/settings/form';
import { createSetting } from './api';

const initialForm = {
    header_logo: '',
    footer_logo: '',
    shop_menu_image: '',
    email: '',
    location: '',
    currency: '',
    google_analytics_id: '',
    social_media: [],
    frontend_utils: {
        timeless_font_family: '',
        features_font_family: '',
        hero_default_font_family: 'Bebas Neue',
        hero_font_family_options_json:
            '[{"label":"Bebas Neue","value":"Bebas Neue"},{"label":"Bebas Neue","value":"Bebas Neue"},{"label":"Times New Roman","value":"times-new-roman"},{"label":"Verdana","value":"verdana"},{"label":"Trebuchet MS","value":"trebuchet-ms"},{"label":"Courier New","value":"courier-new"}]',
        hero_font_family_css_map_json:
            '{"instrument-sans":"\\"Instrument Sans\\", ui-sans-serif, system-ui, sans-serif","georgia":"Georgia, \\"Times New Roman\\", serif","times-new-roman":"\\"Times New Roman\\", Times, serif","verdana":"Verdana, Geneva, sans-serif","trebuchet-ms":"\\"Trebuchet MS\\", Tahoma, sans-serif","courier-new":"\\"Courier New\\", Courier, monospace"}',
    },
};

export default function AddSettings() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [headerLogoFile, setHeaderLogoFile] = useState(null);
    const [footerLogoFile, setFooterLogoFile] = useState(null);
    const [shopMenuImageFile, setShopMenuImageFile] = useState(null);
    const [socialIconFiles, setSocialIconFiles] = useState({});
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const headerLogoPreview = useMemo(() => (headerLogoFile ? URL.createObjectURL(headerLogoFile) : ''), [headerLogoFile]);
    const footerLogoPreview = useMemo(() => (footerLogoFile ? URL.createObjectURL(footerLogoFile) : ''), [footerLogoFile]);
    const shopMenuImagePreview = useMemo(
        () => (shopMenuImageFile ? URL.createObjectURL(shopMenuImageFile) : ''),
        [shopMenuImageFile],
    );

    const socialIconPreviews = useMemo(() => {
        const map = {};
        Object.entries(socialIconFiles).forEach(([index, file]) => {
            if (file instanceof File) {
                map[index] = URL.createObjectURL(file);
            }
        });
        return map;
    }, [socialIconFiles]);

    useEffect(() => {
        setPageTitle('Add Settings');
    }, [setPageTitle]);

    useEffect(() => {
        return () => {
            if (headerLogoPreview) URL.revokeObjectURL(headerLogoPreview);
            if (footerLogoPreview) URL.revokeObjectURL(footerLogoPreview);
            if (shopMenuImagePreview) URL.revokeObjectURL(shopMenuImagePreview);
            Object.values(socialIconPreviews).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [headerLogoPreview, footerLogoPreview, shopMenuImagePreview, socialIconPreviews]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSocialChange = (index, field, value) => {
        setForm((previous) => ({
            ...previous,
            social_media: (previous.social_media || []).map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        }));
    };

    const handleAddSocial = () => {
        setForm((previous) => ({
            ...previous,
            social_media: [...(previous.social_media || []), { name: '', link: '', icon: '' }],
        }));
    };

    const handleRemoveSocial = (indexToRemove) => {
        setForm((previous) => ({
            ...previous,
            social_media: (previous.social_media || []).filter((_, index) => index !== indexToRemove),
        }));

        setSocialIconFiles((previous) => {
            const next = {};
            Object.entries(previous).forEach(([key, value]) => {
                const index = Number(key);
                if (index < indexToRemove) next[index] = value;
                if (index > indexToRemove) next[index - 1] = value;
            });
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            let heroFontOptions = [];
            let heroFontCssMap = {};

            try {
                heroFontOptions = JSON.parse(form.frontend_utils?.hero_font_family_options_json || '[]');
            } catch {
                heroFontOptions = [];
            }

            try {
                heroFontCssMap = JSON.parse(form.frontend_utils?.hero_font_family_css_map_json || '{}');
            } catch {
                heroFontCssMap = {};
            }

            await createSetting({
                ...form,
                frontend_utils: {
                    timeless_font_family: form.frontend_utils?.timeless_font_family || '',
                    features_font_family: form.frontend_utils?.features_font_family || '',
                    hero_default_font_family: form.frontend_utils?.hero_default_font_family || 'instrument-sans',
                    hero_font_family_options: Array.isArray(heroFontOptions) ? heroFontOptions : [],
                    hero_font_family_css_map:
                        heroFontCssMap && typeof heroFontCssMap === 'object' ? heroFontCssMap : {},
                },
                header_logo_file: headerLogoFile,
                footer_logo_file: footerLogoFile,
                shop_menu_image_file: shopMenuImageFile,
                social_icon_files: socialIconFiles,
            });

            toast.success('Settings created successfully', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/settings');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create settings.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <SettingsForm
                    form={form}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    headerLogoPreview={headerLogoPreview}
                    footerLogoPreview={footerLogoPreview}
                    shopMenuImagePreview={shopMenuImagePreview}
                    socialIconPreviews={socialIconPreviews}
                    onChange={handleChange}
                    onHeaderLogoChange={(event) => setHeaderLogoFile(event.target.files?.[0] || null)}
                    onFooterLogoChange={(event) => setFooterLogoFile(event.target.files?.[0] || null)}
                    onShopMenuImageChange={(event) => setShopMenuImageFile(event.target.files?.[0] || null)}
                    onSocialChange={handleSocialChange}
                    onSocialIconChange={(index, file) =>
                        setSocialIconFiles((previous) => {
                            const next = { ...previous };
                            if (!file) {
                                delete next[index];
                                return next;
                            }
                            next[index] = file;
                            return next;
                        })
                    }
                    onAddSocial={handleAddSocial}
                    onRemoveSocial={handleRemoveSocial}
                    onFrontendUtilsChange={(field, value) =>
                        setForm((previous) => ({
                            ...previous,
                            frontend_utils: {
                                ...(previous.frontend_utils || {}),
                                [field]: value,
                            },
                        }))
                    }
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/settings')}
                    submitLabel="Create Settings"
                    submittingLabel="Creating..."
                />
            </div>
        </div>
    );
}
