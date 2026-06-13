import { ArrowLeft, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PageHeader({ isSaving, onSaveDesign, onShare }) {
    return (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
                <ArrowLeft className="size-4" />
                <span>Back to shop</span>
            </a>

            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onSaveDesign} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save design'}
                </Button>
                <Button type="button" variant="outline" onClick={onShare}>
                    <Share2 className="size-4" />
                    Share
                </Button>
            </div>
        </header>
    );
}
