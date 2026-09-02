import { Globe, MessageCircle, Play, Send, Phone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';

const fallbackSocialIcons = {
    facebook: Globe,
    twitter: Send,
    x: Send,
    instagram: MessageCircle,
    youtube: Play,
    tiktok: Play,
};

export default function ContactInformationPanel() {
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload() || {});

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSiteSettings(payload || {});
        });

        setSiteSettings(getSettingsPayload() || {});

        return unsubscribe;
    }, []);

    const contactDetails = useMemo(() => {
        const email = String(siteSettings?.email || '').trim();
        const location = String(siteSettings?.location || '').trim();

        return [
            {
                label: 'Email',
                value: email,
                href: email ? `mailto:${email}` : '',
            },
            {
                label: 'Office Address',
                value: location,
                href: '',
            },
        ].filter((detail) => detail.value); // This hides Email or Office Address if their value is empty
    }, [siteSettings]);

    const socialLinks = useMemo(() => {
        const items = Array.isArray(siteSettings?.social_media) ? siteSettings.social_media : [];

        return items
            .map((item, index) => {
                const label = String(item?.name || '').trim() || `Social ${index + 1}`;
                const href = String(item?.link || '').trim();
                const icon = String(item?.icon || '').trim();

                if (!href) {
                    return null;
                }

                return {
                    label,
                    href,
                    icon,
                    fallbackIcon: fallbackSocialIcons[label.toLowerCase()] || Globe,
                };
            })
            .filter(Boolean);
    }, [siteSettings]);

    return (
        <div>
            <h2 className="font-serif text-[1.9rem] uppercase tracking-[0.02em] text-zinc-900 sm:text-[2.2rem]">
                Contact Information
            </h2>

            <div className="mt-10 space-y-8 text-zinc-600">
                {contactDetails.map((detail) => (
                    <div key={detail.label}>
                        <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-900">
                            {detail.label}
                        </h3>
                        {detail.href ? (
                            <a href={detail.href} className="mt-3 block text-[1rem] leading-8 text-zinc-600 transition-colors hover:text-zinc-900">
                                {detail.value}
                            </a>
                        ) : (
                            <p className="mt-3 text-[1rem] leading-8">
                                {detail.value}
                            </p>
                        )}
                    </div>
                ))}

                {socialLinks && socialLinks.length > 0 && (
                    <div>
                        <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-900">
                            Social Info
                        </h3>

                        <div className="mt-3 flex items-center gap-3">
                            {socialLinks.map(({ label, icon, fallbackIcon: FallbackIcon, href }) => {
                                const isImage = icon && /\.(png|jpe?g|webp|svg|avif)(\?|#|$)/i.test(icon);

                                return (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                                    >
                                        {isImage ? (
                                            <img src={icon} alt={label} className="size-4 object-contain" />
                                        ) : (
                                            <FallbackIcon className="size-4" strokeWidth={1.8} />
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}