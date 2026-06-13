import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Images } from 'lucide-react';

import { Button } from '@/components/ui/button';

import MockupPreviewGrid from './components/MockupPreviewGrid';

export default function MockupPreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [orderDetails, setOrderDetails] = useState(() => location.state?.orderDetails || null);

    useEffect(() => {
        if (orderDetails) return;

        const stored = sessionStorage.getItem('personalizer:pendingOrder');
        if (!stored) return;

        try {
            setOrderDetails(JSON.parse(stored));
        } catch {
            setOrderDetails(null);
        }
    }, [orderDetails]);

    if (!orderDetails) {
        return (
            <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-5 p-6 text-center">
                <Images className="size-10 text-zinc-500" />
                <h1 className="text-2xl font-semibold">No design found for preview</h1>
                <p className="text-sm text-zinc-500">Save your design first, then open mockup preview.</p>
                <Button type="button" onClick={() => navigate('/personalizer/features')}>
                    Back to Personalizer
                </Button>
            </main>
        );
    }

    const frontImageUrl = orderDetails?.frontImageUrl || orderDetails?.imageUrl || '';
    const backImageUrl = orderDetails?.backImageUrl || frontImageUrl;

    return (
        <main className="min-h-screen bg-[#f7f5ef] p-4 sm:p-6">
            <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                <button
                    type="button"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
                    onClick={() => navigate('/personalizer/confirm-order', { state: { orderDetails } })}
                >
                    <ArrowLeft className="size-4" />
                    Back to confirm order
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Mockup previews</h1>
                    <p className="mt-1 text-sm text-zinc-500">Different presentation versions generated from your current design.</p>
                </div>

                <MockupPreviewGrid frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />
            </div>
        </main>
    );
}
