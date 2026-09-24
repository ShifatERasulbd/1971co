import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { requestJson } from '@/lib/apiClient';

export default function ReviewModal({ isOpen, onClose, order }) {
    const [itemReviews, setItemReviews] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse items from order (handling both JSON string or array formats)
    const items = (() => {
        if (!order) return [];
        if (Array.isArray(order.items)) return order.items;
        try {
            return typeof order.items === 'string' ? JSON.parse(order.items) : [];
        } catch {
            return [];
        }
    })();

    // Initialize review state mapped by productId when the modal opens or order changes
    useEffect(() => {
        if (isOpen && items.length > 0) {
            const initial = {};
            items.forEach((item) => {
                const productId = item.productId;
                if (productId) {
                    initial[productId] = {
                        rating: 5,
                        comment: '',
                    };
                }
            });
            setItemReviews(initial);
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const handleRatingChange = (productId, rating) => {
        setItemReviews((prev) => ({
            ...prev,
            [productId]: { ...prev[productId], rating },
        }));
    };

    const handleCommentChange = (productId, comment) => {
        setItemReviews((prev) => ({
            ...prev,
            [productId]: { ...prev[productId], comment },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await requestJson('/api/product-reviews', {
                method: 'POST',
                body: JSON.stringify({
                    orderId: order.id,
                    reviews: itemReviews, // Dictionary object formatted as { productId: { rating, comment }, ... }
                }),
            });

            toast.success('Reviews submitted and product ratings updated successfully!');
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to submit reviews');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Review Order Items</h2>
                        <p className="text-xs font-mono text-zinc-500">Order #{order.order_number}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-sm font-bold text-zinc-400 hover:text-zinc-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                    {items.length === 0 ? (
                        <p className="py-6 text-center text-sm text-zinc-500">No items found in this order.</p>
                    ) : (
                        items.map((item, index) => {
                            const productId = item.productId;
                            const currentReview = itemReviews[productId] || { rating: 5, comment: '' };

                            return (
                                <div key={productId || index} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                                    {/* Item Details Header */}
                                    <div className="flex items-center gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-md border border-zinc-200 object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-zinc-900">{item.name}</h4>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                                                {item.selectedColor && (
                                                    <span className="rounded bg-zinc-200/60 px-2 py-0.5">
                                                        Color: {item.selectedColor}
                                                    </span>
                                                )}
                                                {item.selectedSize && (
                                                    <span className="rounded bg-zinc-200/60 px-2 py-0.5">
                                                        Size: {item.selectedSize}
                                                    </span>
                                                )}
                                                <span className="font-medium text-zinc-700">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Star Rating */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-zinc-700">Rating</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => handleRatingChange(productId, star)}
                                                    className={`text-xl transition-colors focus:outline-none ${
                                                        star <= currentReview.rating
                                                            ? 'text-amber-400'
                                                            : 'text-zinc-300 hover:text-amber-200'
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                            <span className="ml-2 text-xs font-medium text-zinc-600">
                                                {currentReview.rating} / 5
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment Textarea */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-zinc-700">Review Comments</label>
                                        <textarea
                                            rows="2"
                                            value={currentReview.comment}
                                            onChange={(e) => handleCommentChange(productId, e.target.value)}
                                            placeholder="Write your thoughts about this item..."
                                            className="w-full rounded border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-600"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || items.length === 0}
                            className="rounded bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Reviews'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}