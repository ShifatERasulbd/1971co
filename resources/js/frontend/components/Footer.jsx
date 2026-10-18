import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { buildOptimizedImageUrl } from '../utils/media';
import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';
import CookiePreferencesModal from './CookiePreferencesModal.jsx'; // PRIVACY: import

const shopLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Essentials', href: '/shop?collection=essentials' },
    { label: 'Tops', href: '/tops' },
    { label: 'Bottoms', href: '/bottom-more' },
];

const supportLinks = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Return and Refund', href: '/returnandrefund' },
];

const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Condition', href: '/terms' },
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

// Decorative toggle-switch icon (not clickable)
function SwitchIcon({ className = '' }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 30 14"
            className={`pointer-events-none h-3.5 w-[30px] shrink-0 select-none ${className}`}
        >
            <rect x="0" y="0" width="30" height="14" rx="7" fill="#0066FF" />
            <rect x="1.25" y="1.25" width="16" height="11.5" rx="5.75" fill="#fff" />
            <path
                d="M5.2 7.2 L7.8 9.8 L12.6 4.4"
                fill="none"
                stroke="#0066FF"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21.6 4.6 L25.4 9.4 M25.4 4.6 L21.6 9.4"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function FooterCol({ heading, links, onAction }) { // PRIVACY: onAction prop
    const linkClass = `font-monstrate ${sectionTypography.footerLink} text-zinc-400 transition-colors hover:text-white`;

    return (
        <nav aria-label={heading}>
            <h3 className={`font-monstrate ${sectionTypography.footerHeading} text-white`}>
                {heading}
            </h3>
            <ul className="space-y-2.5">
                {links.map(({ label, href, action }) => (
                    <li key={label}>
                        {action ? (
                            // PRIVACY: button that triggers the modal
                            <button
                                type="button"
                                onClick={() => onAction?.(action)}
                                className={`${linkClass} text-left`}
                            >
                                {label}
                            </button>
                        ) : href.startsWith('/') ? (
                            <Link to={href} className={linkClass}>
                                {label}
                            </Link>
                        ) : (
                            <a href={href} className={linkClass}>
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
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // PRIVACY: modal state

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
                        <Link to="/home" className="inline-flex items-baseline gap-0.5">
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
                            
                        </div>
                        
                    </div>

                </div>
            </div>

            <div className="border-t border-zinc-700">
                <div className={`mx-auto flex w-full max-w-[1700px] flex-col items-center justify-between gap-3 px-6 py-5 ${sectionTypography.footerLegal} text-zinc-500 sm:flex-row sm:px-10 lg:px-16`}>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
                        <span className="font-monstrate">© 2026 1971Co. All rights reserved.</span>
                        <span aria-hidden="true" className="font-monstrate text-zinc-600">|</span>
                        <button
                            type="button"
                            onClick={() => setIsPrivacyOpen(true)}
                            className="font-monstrate inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-white"
                        >
                            <span>Your Privacy Choices</span>
                            <SwitchIcon />
                        </button>
                    </div>
                    <div className="overflow-hidden">
                        <img
                            src={optimizedCardImage}
                            alt="Accepted payment cards"
                            className="h-8 w-auto max-w-[240px] object-contain object-right"
                        />
                    </div>
                </div>
            </div>

            {/* PRIVACY: Your Privacy Choices modal */}
            <CookiePreferencesModal
                isOpen={isPrivacyOpen}
                onClose={() => setIsPrivacyOpen(false)}
                logoSrc={footerLogo}
            />
        </footer>
    );
}
