import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const RETURN_REASONS = [
    'Change Of Mind',
    'Size Issue',
    'Color Mismatch',
    'Damage Product',
];

export default function ReturnModal({ isOpen, onClose, order, fetchAvailableSizes, onSubmit }) {
    const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Specific sub-state for "Size Issue" prompt
    const [wantsSizeReplacement, setWantsSizeReplacement] = useState(null); // null, 'yes', or 'no'
    const [itemNewSizes, setItemNewSizes] = useState({});
    const [availableSizes, setAvailableSizes] = useState([]);
    const [isLoadingSizes, setIsLoadingSizes] = useState(false);

    // Reset form state when modal opens/closes or order changes
    useEffect(() => {
        if (isOpen && order) {
            setSelectedReason(RETURN_REASONS[0]);
            setComments('');
            setWantsSizeReplacement(null);
            setItemNewSizes({});
        }
    }, [isOpen, order]);

    // Handle when user switches the main return reason
    function handleReasonChange(newReason) {
        setSelectedReason(newReason);
        if (newReason === 'Size Issue') {
            setWantsSizeReplacement(null); // Prompt user if they want to replace size
            setItemNewSizes({});
        } else {
            setWantsSizeReplacement(null);
        }
    }

    // Load available sizes from database when user clicks "Yes" for size replacement
    async function handleSizeReplacementChoice(choice) {
        setWantsSizeReplacement(choice);
        if (choice === 'yes' && availableSizes.length === 0) {
            setIsLoadingSizes(true);
            try {
                const sizes = await fetchAvailableSizes();
                setAvailableSizes(sizes || []);
            } catch (error) {
                toast.error('Failed to load available sizes');
            } finally {
                setIsLoadingSizes(false);
            }
        }
    }

    if (!isOpen || !order) return null;

    const isSizeIssue = selectedReason === 'Size Issue';
    const orderItems = order.items || order.order_items || [];

    function handleItemSizeChange(itemId, newSize) {
        setItemNewSizes((prev) => ({
            ...prev,
            [itemId]: newSize,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                orderId: order.id,
                reason: selectedReason,
                comments: comments.trim(),
                wantsSizeReplacement: isSizeIssue ? wantsSizeReplacement : null,
                itemSizeReplacements: isSizeIssue && wantsSizeReplacement === 'yes' ? itemNewSizes : undefined,
            };

            await onSubmit(payload);
            toast.success('Return request submitted successfully');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to submit return request');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-zinc-950">Initiate Return</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                    Order #{order.order_number || order.id}
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Return Reason Selection */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700">
                            Return Reason
                        </label>
                        <select
                            value={selectedReason}
                            onChange={(e) => handleReasonChange(e.target.value)}
                            className="h-9 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600"
                        >
                            {RETURN_REASONS.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Size Issue Prompt Question */}
                    {isSizeIssue && (
                        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-amber-900">
                                Do you want to replace the size?
                            </h4>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSizeReplacementChoice('yes')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium border ${
                                        wantsSizeReplacement === 'yes'
                                            ? 'bg-amber-600 text-white border-amber-600'
                                            : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSizeReplacementChoice('no')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium border ${
                                        wantsSizeReplacement === 'no'
                                            ? 'bg-zinc-700 text-white border-zinc-700'
                                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                                    }`}
                                >
                                    No (Standard Return/Refund)
                                </button>
                            </div>

                            {/* Products Queue Displayed Only if User Clicks 'Yes' */}
                            {wantsSizeReplacement === 'yes' && (
                                <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-3">
                                    <h5 className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                                        Select replacement sizes for ordered items:
                                    </h5>

                                    {isLoadingSizes ? (
                                        <p className="text-xs text-zinc-400 py-2">Loading available sizes...</p>
                                    ) : orderItems.length === 0 ? (
                                        <p className="text-xs text-zinc-500">No items found in this order queue.</p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {orderItems.map((item, index) => {
                                                const itemId = item.lineId || item.id || index;
                                                const productName = item.name || item.product_name || 'Product Item';
                                                const currentSize = item.selectedSize || item.size || item.selected_size || 'N/A';
                                                const selectedSize = itemNewSizes[itemId] || currentSize;

                                                // Fallback to global availableSizes if product-specific sizes aren't present
                                                const itemSizes = item.available_sizes || item.variants || availableSizes;

                                                return (
                                                    <div key={itemId} className="bg-white rounded border border-zinc-200 p-3 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-medium text-zinc-800">
                                                                {productName}
                                                            </span>
                                                            <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                                                                Ordered Size: <strong className="text-zinc-800">{currentSize}</strong>
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="block text-[11px] text-zinc-600">
                                                                Replacement Size:
                                                            </label>
                                                            <select
                                                                value={selectedSize}
                                                                onChange={(e) => handleItemSizeChange(itemId, e.target.value)}
                                                                className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-600"
                                                            >
                                                                {itemSizes.map((sizeOption, idx) => {
                                                                    const sizeValue = typeof sizeOption === 'object' ? (sizeOption.Size || sizeOption.size || sizeOption.name) : sizeOption;
                                                                    return (
                                                                        <option key={idx} value={sizeValue}>
                                                                            {sizeValue}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Comments */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700">
                            Additional Comments (Optional)
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={3}
                            placeholder="Provide any extra details..."
                            className="w-full rounded border border-zinc-300 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-600"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (isSizeIssue && wantsSizeReplacement === null)}
                            className="rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Return'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}