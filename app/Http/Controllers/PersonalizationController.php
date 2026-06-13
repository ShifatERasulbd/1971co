<?php

namespace App\Http\Controllers;

use App\Models\Personalization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PersonalizationController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Personalization::query()
            ->latest()
            ->get()
            ->map(fn (Personalization $record) => $this->transformRecord($record));

        return response()->json($items);
    }

    public function show(Personalization $personalization): JsonResponse
    {
        return response()->json($this->transformRecord($personalization));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'string'],
            'front_image' => ['nullable', 'string'],
            'back_image' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'total_price' => ['nullable', 'numeric', 'min:0'],
            'order_status' => ['nullable', 'string', 'max:50'],
        ]);

        $path = $this->decodeAndStoreImage($validated['image']);
        if (!$path) {
            return response()->json(['message' => 'Invalid image data.'], 422);
        }

        $meta = $validated['meta'] ?? [];

        $frontImageData = $validated['front_image'] ?? null;
        $backImageData = $validated['back_image'] ?? null;

        if (!$frontImageData && !empty($validated['meta']['front_image'])) {
            $frontImageData = $validated['meta']['front_image'];
        }

        if (!$backImageData && !empty($validated['meta']['back_image'])) {
            $backImageData = $validated['meta']['back_image'];
        }

        $frontPath = null;
        $backPath = null;

        if (!empty($frontImageData)) {
            $frontPath = $this->decodeAndStoreImage($frontImageData);
            if (!$frontPath) {
                return response()->json(['message' => 'Invalid front image data.'], 422);
            }
        }

        if (!empty($backImageData)) {
            $backPath = $this->decodeAndStoreImage($backImageData);
            if (!$backPath) {
                return response()->json(['message' => 'Invalid back image data.'], 422);
            }
        }

        unset($meta['front_image'], $meta['back_image'], $meta['front_image_path'], $meta['back_image_path']);

        $quantity = max(1, (int) ($validated['quantity'] ?? 1));
        $unitPrice = (float) ($validated['unit_price'] ?? 0);
        $totalPrice = array_key_exists('total_price', $validated)
            ? (float) $validated['total_price']
            : $unitPrice * $quantity;
        $orderStatus = trim((string) ($validated['order_status'] ?? 'pending'));
        if ($orderStatus === '') {
            $orderStatus = 'pending';
        }

        $record = Personalization::query()->create([
            'user_id' => $request->user()?->id,
            'title' => $validated['title'] ?? 'Customized Product Design',
            'image_path' => $path,
            'front_image_path' => $frontPath,
            'back_image_path' => $backPath,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'order_status' => strtolower($orderStatus),
            'meta' => $meta,
        ]);

        return response()->json([
            'message' => 'Design saved successfully.',
            'data' => $this->transformRecord($record),
        ], 201);
    }

    public function update(Request $request, Personalization $personalization): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'total_price' => ['nullable', 'numeric', 'min:0'],
            'order_status' => ['nullable', 'string', 'max:50'],
        ]);

        $meta = $personalization->meta ?? [];
        if (array_key_exists('meta', $validated) && is_array($validated['meta'])) {
            $meta = array_merge($meta, $validated['meta']);
        }

        $quantity = array_key_exists('quantity', $validated)
            ? max(1, (int) $validated['quantity'])
            : ($personalization->quantity ?? 1);

        $unitPrice = array_key_exists('unit_price', $validated)
            ? (float) $validated['unit_price']
            : (float) ($personalization->unit_price ?? 0);

        $totalPrice = array_key_exists('total_price', $validated)
            ? (float) $validated['total_price']
            : $unitPrice * $quantity;

        $orderStatus = array_key_exists('order_status', $validated)
            ? strtolower(trim((string) $validated['order_status']))
            : (string) ($personalization->order_status ?? 'pending');
        if ($orderStatus === '') {
            $orderStatus = 'pending';
        }

        unset($meta['quantity']);

        $personalization->update([
            'title' => $validated['title'] ?? $personalization->title,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'order_status' => $orderStatus,
            'meta' => $meta,
        ]);

        return response()->json([
            'message' => 'Personalization order updated successfully.',
            'data' => $this->transformRecord($personalization->fresh()),
        ]);
    }

    public function confirm(Personalization $personalization): JsonResponse
    {
        $personalization->update(['order_status' => 'confirmed']);

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => $this->transformRecord($personalization->fresh()),
        ]);
    }

    public function destroy(Personalization $personalization): JsonResponse
    {
        if ($personalization->image_path) {
            $abs = public_path($personalization->image_path);
            if (file_exists($abs)) @unlink($abs);
        }

        $frontPath = $personalization->front_image_path ?: ($personalization->meta['front_image_path'] ?? null);
        if ($frontPath) {
            $abs = public_path($frontPath);
            if (file_exists($abs)) @unlink($abs);
        }

        $backPath = $personalization->back_image_path ?: ($personalization->meta['back_image_path'] ?? null);
        if ($backPath) {
            $abs = public_path($backPath);
            if (file_exists($abs)) @unlink($abs);
        }

        $personalization->delete();

        return response()->json([
            'message' => 'Personalization order deleted successfully.',
        ]);
    }

    private function transformRecord(Personalization $record): array
    {
        $meta = $record->meta ?? [];
        $frontImagePath = $record->front_image_path ?: ($meta['front_image_path'] ?? null);
        $backImagePath = $record->back_image_path ?: ($meta['back_image_path'] ?? null);
        $quantity = $record->quantity ?? ($meta['quantity'] ?? 1);
        $unitPrice = (float) ($record->unit_price ?? ($meta['unit_price'] ?? 0));
        $totalPrice = (float) ($record->total_price ?? ($unitPrice * max(1, (int) $quantity)));
        $orderStatus = $record->order_status ?? ($meta['order_status'] ?? 'pending');

        return [
            'id' => $record->id,
            'user_id' => $record->user_id,
            'title' => $record->title,
            'image_path' => $record->image_path,
            'image_url' => '/' . $record->image_path,
            'front_image_url' => $frontImagePath ? '/' . $frontImagePath : '/' . $record->image_path,
            'back_image_url' => $backImagePath ? '/' . $backImagePath : null,
            'quantity' => (int) $quantity,
            'unit_price' => round($unitPrice, 2),
            'total_price' => round($totalPrice, 2),
            'order_status' => strtolower((string) $orderStatus),
            'meta' => $meta,
            'created_at' => optional($record->created_at)?->toISOString(),
            'updated_at' => optional($record->updated_at)?->toISOString(),
        ];
    }

    private function decodeAndStoreImage(string $image): ?string
    {
        if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $image)) {
            return null;
        }

        $base64 = preg_replace('/^data:image\/(png|jpeg|jpg);base64,/', '', $image);
        $binary = base64_decode(str_replace(' ', '+', $base64), true);

        if ($binary === false) {
            return null;
        }

        $fileName = 'order-design-' . Str::uuid() . '.png';
        $relativePath = 'uploads/personalizer/order/' . $fileName;
        $absolutePath = public_path($relativePath);

        if (!is_dir(dirname($absolutePath))) {
            mkdir(dirname($absolutePath), 0755, true);
        }

        file_put_contents($absolutePath, $binary);

        return $relativePath;
    }
}
