import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { buildOptimizedImageUrl } from '../utils/media';
import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const shopLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Essentials', href: '/shop?collection=essentials' },
    { label: 'Tops', href: '/tops' },
    { label: 'Bottoms', href: '/bottom-more' },
];

const supportLinks = [
    { label: 'Shipping', href: '/shipping' },
  
    { label: 'Contact', href: '/contact' },
];

const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
];

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
    const [footerEmail, setFooterEmail] = useState('');

    const handleFooterEmailSubmit = (event) => {
        event.preventDefault();

        toast.success('Thank you for subscribing! Stay tuned for drops and restocks.', {
            style: { color: '#16a34a' },
        });
        setFooterEmail('');
    };

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

    const optimizedCardImage = useMemo(
        () => buildOptimizedImageUrl('/cardImage.png', { w: 520, q: 70 }),
        []
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
            .filter((item) => item.label && item.href && item.icon);
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
                            {socialFromSettings.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="inline-flex size-8 items-center justify-center overflow-hidden rounded border border-zinc-600 text-zinc-400 transition-colors hover:border-white hover:text-white"
                                >
                                    <img src={s.icon} alt={s.label} className="size-full object-cover" />
                                </a>
                            ))}
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
                                onSubmit={handleFooterEmailSubmit}
                                className="flex flex-col items-start gap-2 sm:flex-row sm:items-stretch sm:gap-0 border-b border-zinc-600 focus-within:border-white transition-colors"
                            >
                                <label htmlFor="footer-email" className="sr-only">Email address</label>
                                <input
                                    id="footer-email"
                                    type="email"
                                    value={footerEmail}
                                    onChange={(event) => setFooterEmail(event.target.value)}
                                    placeholder="Email address"
                                    required
                                    className={`font-monstrate w-full flex-1 bg-transparent py-2 ${sectionTypography.footerLink} text-white outline-none placeholder:text-zinc-500`}
                                />
                                <button
                                    type="submit"
                                    className="font-monstrate py-2 sm:pl-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-60"
                                >
                                    Join
                                </button>
                            </form>
                            <div className="mb-5 overflow-hidden">
                               <img
                                    src="/cardImage.png"
                                    alt="Accepted payment cards"
                                    className="h-10 w-full object-contain object-center px-2"
                                />
                            </div>
                        </div>
                        
                    </div>

                </div>
            </div>

            <div className="border-t border-zinc-700">
                <div className={`mx-auto flex w-full max-w-[1700px] flex-col items-center justify-between gap-3 px-6 py-5 ${sectionTypography.footerLegal} text-zinc-500 sm:flex-row sm:px-10 lg:px-16`}>
                    <span>© 2026 1971Co. All rights reserved.</span>
                </div>
                </div>
        </footer>
    );
}
