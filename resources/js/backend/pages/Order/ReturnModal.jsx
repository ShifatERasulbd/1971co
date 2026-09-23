import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const RETURN_REASONS = [
    'Change Of Mind',
    'Size Issue',
    'Color Mismatch',
    'Damage Product',
];

export default function ReturnModal({ isOpen, onClose, order, fetchAvailableSizes }) {
    const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Specific sub-state for "Size Issue" prompt
    const [wantsSizeReplacement, setWantsSizeReplacement] = useState(null); // null, 'yes', or 'no'
    const [itemNewSizes, setItemNewSizes] = useState({});
    const [availableSizes, setAvailableSizes] = useState([]);
    const [isLoadingSizes, setIsLoadingSizes] = useState(false);

    // Specific sub-state for "Damage Product" prompt
    const [unpackingVideo, setUnpackingVideo] = useState(null);

    // Reset form state when modal opens/closes or order changes
    useEffect(() => {
        if (isOpen && order) {
            setSelectedReason(RETURN_REASONS[0]);
            setComments('');
            setWantsSizeReplacement(null);
            setItemNewSizes({});
            setUnpackingVideo(null);
        }
    }, [isOpen, order]);

    // Handle when user switches the main return reason
    function handleReasonChange(newReason) {
        setSelectedReason(newReason);
        if (newReason === 'Size Issue') {
            setWantsSizeReplacement(null);
            setItemNewSizes({});
        } else {
            setWantsSizeReplacement(null);
        }

        if (newReason !== 'Damage Product') {
            setUnpackingVideo(null);
        }
    }

    // Handle file selection
    const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // must match backend max:102400
    function handleVideoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            toast.error('Video is too large. Please upload a video under 100MB.');
            e.target.value = '';
            setUnpackingVideo(null);
            return;
        }
        setUnpackingVideo(file);
        toast.success('Video selected successfully');
    }

    // Load available sizes from database when user clicks "Yes" for size replacement
    async function handleSizeReplacementChoice(choice) {
        setWantsSizeReplacement(choice);
        if (choice === 'yes' && availableSizes.length === 0 && fetchAvailableSizes) {
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
    const isDamageProduct = selectedReason === 'Damage Product';
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
            const formData = new FormData();
            formData.append('orderId', order.id);
            formData.append('reason', selectedReason);
            formData.append('comments', comments.trim());

            if (isSizeIssue) {
                formData.append('wantsSizeReplacement', wantsSizeReplacement || 'no');
                if (wantsSizeReplacement === 'yes') {
                    formData.append('itemSizeReplacements', JSON.stringify(itemNewSizes));
                }
            }

            if (isDamageProduct && unpackingVideo) {
                formData.append('unpackingVideo', unpackingVideo);
            }

            // Send multipart form data to Laravel backend
            const response = await axios.post('/api/return-requests', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(response.data.message || 'Return request submitted successfully');
            onClose();
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            const firstValidationError = validationErrors && Object.values(validationErrors)[0]?.[0];
            toast.error(firstValidationError || error.response?.data?.message || error.message || 'Failed to submit return request');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Montserrat',sans-serif]">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-zinc-950 font-['Montserrat',sans-serif]">Initiate Return</h3>
                <p className="mt-0.5 text-xs text-zinc-500 font-['Montserrat',sans-serif]">
                    Order #{order.order_number || order.id}
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Return Reason Selection */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700 font-['Montserrat',sans-serif]">
                            Return Reason
                        </label>
                        <select
                            value={selectedReason}
                            onChange={(e) => handleReasonChange(e.target.value)}
                            className="h-9 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-600 font-['Montserrat',sans-serif]"
                        >
                            {RETURN_REASONS.map((reason) => (
                                <option key={reason} value={reason} className="font-['Montserrat',sans-serif]">
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Size Issue Prompt Question */}
                    {isSizeIssue && (
                        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-4 space-y-3 font-['Montserrat',sans-serif]">
                            <h4 className="text-xs font-semibold text-amber-900 font-['Montserrat',sans-serif]">
                                Do you want to replace the size?
                            </h4>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSizeReplacementChoice('yes')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium border font-['Montserrat',sans-serif] ${
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
                                    className={`px-4 py-1.5 rounded text-xs font-medium border font-['Montserrat',sans-serif] ${
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
                                <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-3 font-['Montserrat',sans-serif]">
                                    <h5 className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider font-['Montserrat',sans-serif]">
                                        Select replacement sizes for ordered items:
                                    </h5>

                                    {isLoadingSizes ? (
                                        <p className="text-xs text-zinc-400 py-2 font-['Montserrat',sans-serif]">Loading available sizes...</p>
                                    ) : orderItems.length === 0 ? (
                                        <p className="text-xs text-zinc-500 font-['Montserrat',sans-serif]">No items found in this order queue.</p>
                                    ) : (
                                        <div className="space-y-2.5 font-['Montserrat',sans-serif]">
                                            {orderItems.map((item, index) => {
                                                const itemId = item.lineId || item.id || index;
                                                const productName = item.name || item.product_name || 'Product Item';
                                                const currentSize = item.selectedSize || item.size || item.selected_size || 'N/A';
                                                const selectedSize = itemNewSizes[itemId] || currentSize;

                                                const itemSizes = item.available_sizes || item.variants || availableSizes;

                                                return (
                                                    <div key={itemId} className="bg-white rounded border border-zinc-200 p-3 space-y-2 font-['Montserrat',sans-serif]">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-medium text-zinc-800 font-['Montserrat',sans-serif]">
                                                                {productName}
                                                            </span>
                                                            <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded font-['Montserrat',sans-serif]">
                                                                Ordered Size: <strong className="text-zinc-800 font-['Montserrat',sans-serif]">{currentSize}</strong>
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="block text-[11px] text-zinc-600 font-['Montserrat',sans-serif]">
                                                                Replacement Size:
                                                            </label>
                                                            <select
                                                                value={selectedSize}
                                                                onChange={(e) => handleItemSizeChange(itemId, e.target.value)}
                                                                className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-xs text-zinc-900 outline-none focus:border-zinc-600 font-['Montserrat',sans-serif]"
                                                            >
                                                                {itemSizes.map((sizeOption, idx) => {
                                                                    const sizeValue = typeof sizeOption === 'object' ? (sizeOption.Size || sizeOption.size || sizeOption.name) : sizeOption;
                                                                    return (
                                                                        <option key={idx} value={sizeValue} className="font-['Montserrat',sans-serif]">
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

                    {/* Damage Product Unpacking Video Upload Field */}
                    {isDamageProduct && (
                        <div className="rounded-md border border-red-200 bg-red-50/50 p-4 space-y-2 font-['Montserrat',sans-serif]">
                            <label className="block text-xs font-semibold text-red-900 font-['Montserrat',sans-serif]">
                                Unpacking Video Proof Required <span className="text-red-600">*</span>
                            </label>
                            <p className="text-[11px] text-red-700/80 font-['Montserrat',sans-serif]">
                                Please upload a clear continuous video of you unpacking the package to verify the damage. (Max 100MB)
                            </p>
                            
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer font-['Montserrat',sans-serif]"
                            />

                            {unpackingVideo && (
                                <p className="text-[11px] text-zinc-600 font-medium font-['Montserrat',sans-serif]">
                                    Selected file: {unpackingVideo.name}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Additional Comments */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700 font-['Montserrat',sans-serif]">
                            Additional Comments (Optional)
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={3}
                            placeholder="Provide any extra details..."
                            className="w-full rounded border border-zinc-300 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-600 font-['Montserrat',sans-serif]"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 font-['Montserrat',sans-serif]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 font-['Montserrat',sans-serif]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                (isSizeIssue && wantsSizeReplacement === null) ||
                                (isDamageProduct && !unpackingVideo)
                            }
                            className="rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 font-['Montserrat',sans-serif]"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Return'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}