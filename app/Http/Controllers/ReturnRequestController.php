<?php

namespace App\Http\Controllers;

use App\Models\ReturnRequest;
use App\Models\CheckoutOrder;
use App\Mail\ReturnRequestEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ReturnRequestController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate the incoming request
        $validated = $request->validate([
            'orderId' => 'required',
            'reason' => 'required|string',
            'comments' => 'nullable|string',
            'unpackingVideo' => 'nullable|file|mimes:mp4,mov,avi,webm|max:20480', // max 20MB
            'wantsSizeReplacement' => 'nullable|string|in:yes,no',
            'itemSizeReplacements' => 'nullable|json',
        ]);

        // 2. Find the original checkout order
        $order = CheckoutOrder::find($validated['orderId']);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $orderNumber = $order->order_number;
        $isSizeIssue = $validated['reason'] === 'Size Issue';
        $wantsReplacement = ($validated['wantsSizeReplacement'] ?? 'no') === 'yes';

        $itemSizeReplacements = isset($validated['itemSizeReplacements']) 
            ? json_decode($validated['itemSizeReplacements'], true) 
            : [];

        DB::beginTransaction();

        try {
            // 3. Update the original order status
            $order->update([
                'status' => $isSizeIssue && $wantsReplacement ? 'Replacement Requested' : 'Return Requested'
            ]);

       

            // 5. Handle file upload if present
            $videoPath = null;
            if ($request->hasFile('unpackingVideo')) {
                $videoPath = $request->file('unpackingVideo')->store('return-videos', 'public');
            }

            // 6. Save the return request record
            $returnRequest = ReturnRequest::create([
                'order_number' => $orderNumber,
                'request_reason' => $validated['reason'],
                'additional_text' => $validated['comments'] ?? null,
                'uploaded_document' => $videoPath,
                'wants_size_replacement' => $validated['wantsSizeReplacement'] ?? null,
                'item_size_replacements' => !empty($itemSizeReplacements) ? $itemSizeReplacements : null,
            ]);

            DB::commit();

            // 7. Send confirmation email to the customer
            if (!empty($order->email)) {
                Mail::to($order->email)->send(new ReturnRequestEmail($order, $returnRequest));
            }

            return response()->json([
                'success' => true,
                'message' => $isSizeIssue && $wantsReplacement 
                    ? 'Return and replacement order created successfully!' 
                    : 'Return request submitted successfully!',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Public, API-key protected feed of return requests for external systems (e.g. Inventory).
     */
    public function publicExternalIndex(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'since_id' => 'nullable|integer|min:0',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        $query = ReturnRequest::query()->orderBy('id');

        if (! empty($validated['since_id'])) {
            $query->where('id', '>', (int) $validated['since_id']);
        }

        $returnRequests = $query
            ->limit((int) ($validated['per_page'] ?? 100))
            ->get();

        return response()->json([
            'success' => true,
            'count' => $returnRequests->count(),
            'return_requests' => $returnRequests->map(fn (ReturnRequest $returnRequest) => $this->formatExternalReturnRequest($returnRequest))->values(),
        ]);
    }

    public function publicExternalShow(ReturnRequest $returnRequest): JsonResponse
    {
        return response()->json([
            'success' => true,
            'return_request' => $this->formatExternalReturnRequest($returnRequest),
        ]);
    }

    protected function formatExternalReturnRequest(ReturnRequest $returnRequest): array
    {
        $order = CheckoutOrder::where('order_number', $returnRequest->order_number)->first();

        return [
            'id' => (int) $returnRequest->id,
            'order_number' => (string) $returnRequest->order_number,
            'request_reason' => (string) $returnRequest->request_reason,
            'additional_text' => $returnRequest->additional_text,
            'uploaded_document' => $returnRequest->uploaded_document
                ? Storage::disk('public')->url($returnRequest->uploaded_document)
                : null,
            'wants_size_replacement' => $returnRequest->wants_size_replacement,
            'item_size_replacements' => $returnRequest->item_size_replacements,
            'order_details' => $returnRequest->order_details,
            'user_id' => $returnRequest->userId,
            'order' => $order ? [
                'id' => (int) $order->id,
                'order_number' => (string) $order->order_number,
                'status' => (string) $order->status,
                'first_name' => (string) $order->first_name,
                'last_name' => (string) $order->last_name,
                'email' => (string) $order->email,
                'phone' => $order->phone,
                'total' => (float) $order->total,
                'items' => $order->items,
            ] : null,
            'created_at' => $returnRequest->created_at,
            'updated_at' => $returnRequest->updated_at,
        ];
    }
}