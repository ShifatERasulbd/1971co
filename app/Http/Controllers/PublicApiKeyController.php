<?php

namespace App\Http\Controllers;

use App\Models\PublicApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicApiKeyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            PublicApiKey::query()
                ->orderByDesc('id')
                ->get([
                    'id',
                    'name',
                    'key_preview',
                    'is_active',
                    'created_by',
                    'last_used_at',
                    'revoked_at',
                    'created_at',
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:120',
        ]);

        $name = trim((string) ($validated['name'] ?? 'Inventory Public API Key'));
        $plainKey = Str::random(48);
        $keyHash = hash('sha256', $plainKey);

        $preview = substr($plainKey, 0, 8)
            .'...'
            .substr($plainKey, -4);

        $apiKey = PublicApiKey::query()->create([
            'name' => $name,
            'key_hash' => $keyHash,
            'key_preview' => $preview,
            'is_active' => true,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Public API key generated successfully. Save it now; it will not be shown again.',
            'key' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key_preview' => $apiKey->key_preview,
                'plain_text_key' => $plainKey,
                'is_active' => $apiKey->is_active,
                'created_at' => $apiKey->created_at,
            ],
        ], 201);
    }

    public function destroy(PublicApiKey $publicApiKey): JsonResponse
    {
        if (! $publicApiKey->is_active) {
            return response()->json([
                'message' => 'Key is already revoked.',
            ]);
        }

        $publicApiKey->update([
            'is_active' => false,
            'revoked_at' => now(),
        ]);

        return response()->json([
            'message' => 'Public API key revoked successfully.',
        ]);
    }
}
