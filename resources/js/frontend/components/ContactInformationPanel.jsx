import { Globe, MessageCircle, Play, Send } from 'lucide-react';

const contactDetails = [
    {
        label: 'Office',
        value: '70 Washington Square',
        secondary: 'New York, NY 10012, USA',
    },
    {
        label: 'Phone',
        value: '(2) 123 -456 -789',
    },
    {
        label: 'Email',
        value: 'hello@timeless.ca',
    },
];

const socialLinks = [
    { label: 'Facebook', icon: Globe, href: '#facebook' },
    { label: 'Twitter', icon: Send, href: '#twitter' },
    { label: 'Instagram', icon: MessageCircle, href: '#instagram' },
    { label: 'YouTube', icon: Play, href: '#youtube' },
];

export default function ContactInformationPanel() {
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
                        <p className="mt-3 text-[1rem] leading-8">
                            {detail.value}
                            {detail.secondary ? <span className="block">{detail.secondary}</span> : null}
                        </p>
                    </div>
                ))}

                <div>
                    <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-900">
                        Social Info
                    </h3>

                    <div className="mt-3 flex items-center gap-3">
                        {socialLinks.map(({ label, icon: Icon, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                            >
                                <Icon className="size-4" strokeWidth={1.8} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
