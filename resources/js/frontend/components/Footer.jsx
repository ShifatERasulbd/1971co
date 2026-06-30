import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const shopLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Essentials', href: '/shop?collection=essentials' },
    { label: 'Tops', href: '/shop?collection=tops' },
    { label: 'Bottoms', href: '/shop?collection=bottoms' },
];

const supportLinks = [
    { label: 'Shipping', href: '#shipping' },
    { label: 'Returns', href: '#returns' },
    { label: 'Contact', href: '/contact' },
];

const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
];

const socialLinks = [
    {
        label: 'Instagram',
        href: '#instagram',
        icon: (
            <>
                <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
            </>
        ),
    },
    {
        label: 'YouTube',
        href: '#youtube',
        icon: (
            <>
                <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <path d="M10 9.5l5 2.5-5 2.5V9.5Z" fill="currentColor" />
            </>
        ),
    },
    {
        label: 'TikTok',
        href: '#tiktok',
        icon: (
            <path d="M16 3h-3v11.5a2.5 2.5 0 1 1-2.5-2.5c.23 0 .45.03.67.08V8.98A6.5 6.5 0 1 0 16 15V8.5a8.48 8.48 0 0 0 4 1V6.5A4.5 4.5 0 0 1 16 3Z" fill="currentColor" />
        ),
    },
    {
        label: 'X',
        href: '#x',
        icon: (
            <path d="M17.5 4h2.5l-5.5 6.3L21 20h-5.1l-3.5-4.6L8.1 20H5.6l5.9-6.7L4 4h5.2l3.2 4.2L17.5 4Zm-.9 14.4h1.4L7.5 5.4H6L16.6 18.4Z" fill="currentColor" />
        ),
    },
];

function SocialButton({ href, label, children }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="inline-flex size-8 items-center justify-center border border-zinc-600 text-zinc-400 transition-colors hover:border-white hover:text-white"
        >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                {children}
            </svg>
        </a>
    );
}

function resolveAssetUrl(path) {
    if (typeof path !== 'string') {
        return '';
    }

    const raw = path.trim();
    if (!raw) {
        return '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        return raw;
    }

    return `/${raw.replace(/^\/+/, '')}`;
}

function FooterCol({ heading, links }) {
    return (
        <nav aria-label={heading}>
            <h3 className={`font-monstrate ${sectionTypography.footerHeading} text-white`}>
                {heading}
            </h3>
            <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                    <li key={label}>
                        {href.startsWith('/') ? (
                            <Link
                                to={href}
                                className={`font-monstrate ${sectionTypography.footerLink} text-zinc-400 transition-colors hover:text-white`}
                            >
                                {label}
                            </Link>
                        ) : (
                            <a
                                href={href}
                                className={`font-monstrate ${sectionTypography.footerLink} text-zinc-400 transition-colors hover:text-white`}
                            >
                                {label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default function Footer() {
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload());

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSiteSettings(payload || {});
        });

        setSiteSettings(getSettingsPayload() || {});

        return unsubscribe;
    }, []);

    const footerLogo = useMemo(
        () => resolveAssetUrl(siteSettings?.footer_logo || ''),
        [siteSettings],
    );

    const socialFromSettings = useMemo(() => {
        const items = Array.isArray(siteSettings?.social_media) ? siteSettings.social_media : [];

        return items
            .map((item, index) => {
                const name = String(item?.name || '').trim() || `Social ${index + 1}`;
                const link = String(item?.link || '').trim() || '#';
                const icon = resolveAssetUrl(item?.icon || '');

                return {
                    label: name,
                    href: link,
                    icon,
                };
            })
            .filter((item) => item.label && item.href);
    }, [siteSettings]);

    const contactEmail = String(siteSettings?.email || '').trim() || 'support@1971co.com';

    return (
        <footer className={`${timelessFontClass} font-monstrate bg-[#1a1a1a] text-white`}>
            {/* Main grid */}
            <div className="mx-auto w-full max-w-[1700px] px-6 pb-14 pt-14 sm:px-10 lg:px-16">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.5fr]">

                    {/* Brand column */}
                    <div className="space-y-5">
                        <Link to="/" className="inline-flex items-baseline gap-0.5">
                            {footerLogo ? (
                                <img
                                    src={footerLogo}
                                    alt="1971Co"
                                    className="h-8 w-auto max-w-[220px] object-contain"
                                />
                            ) : (
                                <>
                                    <span className={`${sectionTypography.footerBrandPrimary} text-white`}>
                                        1971
                                    </span>
                                    <span className={`${sectionTypography.footerBrandSecondary} text-white`}>
                                        Co.
                                    </span>
                                </>
                            )}
                        </Link>

                        <div className="flex items-center gap-2">
                            {(socialFromSettings.length > 0 ? socialFromSettings : socialLinks).map((s) =>
                                typeof s.icon === 'string' && s.icon.trim() !== '' ? (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        aria-label={s.label}
                                        className="inline-flex size-8 items-center justify-center border border-zinc-600 text-zinc-400 transition-colors hover:border-white hover:text-white"
                                    >
                                        <img src={s.icon} alt={s.label} className="size-4 object-contain" />
                                    </a>
                                ) : (
                                    <SocialButton key={s.label} href={s.href} label={s.label}>
                                        {s.icon}
                                    </SocialButton>
                                )
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:contents">
                        <FooterCol heading="Shop" links={shopLinks} />
                        <FooterCol heading="Support" links={supportLinks} />
                        <FooterCol heading="Company" links={companyLinks} />

                        {/* Newsletter column */}
                        <div>
                            <h3 className={`font-monstrate ${sectionTypography.footerHeading} text-white`}>
                                Stay Connected
                            </h3>
                            <p className={`font-monstrate mb-5 ${sectionTypography.footerLink} text-zinc-400`}>
                                {contactEmail}
                            </p>
                            
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex items-stretch border-b border-zinc-600 focus-within:border-white transition-colors"
                            >
                                <label htmlFor="footer-email" className="sr-only">Email address</label>
                                <input
                                    id="footer-email"
                                    type="email"
                                    placeholder="Email address"
                                    required
                                    className={`font-monstrate flex-1 bg-transparent py-2 ${sectionTypography.footerLink} text-white outline-none placeholder:text-zinc-500`}
                                />
                                <button
                                    type="submit"
                                    className="font-monstrate py-2 pl-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-60"
                                >
                                    Join
                                </button>
                            </form>
                            <div className="mb-5 overflow-hidden">
                                <img
                                    src="/cardImage.png"
                                    alt="Payment and card information"
                                    className="h-20 w-full object-contain object-center p-3 sm:h-24"
                                />
                            </div>
                        </div>
                        
                    </div>

                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-zinc-700">
                <div className={`mx-auto flex w-full max-w-[1700px] flex-col items-center justify-between gap-3 px-6 py-5 ${sectionTypography.footerLegal} text-zinc-500 sm:flex-row sm:px-10 lg:px-16`}>
                    <span>© 2026 1971Co. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
