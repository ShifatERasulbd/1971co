<?php

namespace App\Http\Controllers;

use App\Models\CompliancePage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompliancePageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(CompliancePage::orderByDesc('created_at')->get());
    }

    public function publicIndex(): JsonResponse
    {
        $page = CompliancePage::orderByDesc('created_at')->first();

        return response()->json($page);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'terms_and_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'shipping_and_return' => 'nullable|string',
        ]);

        $page = CompliancePage::create([
            'title' => trim((string) ($validated['title'] ?? '')),
            'terms_and_conditions' => $validated['terms_and_conditions'] ?? '',
            'privacy_policy' => $validated['privacy_policy'] ?? '',
            'shipping_and_return' => $validated['shipping_and_return'] ?? '',
        ]);

        return response()->json($page, 201);
    }

    public function show(CompliancePage $compliance): JsonResponse
    {
        return response()->json($compliance);
    }

    public function update(Request $request, CompliancePage $compliance): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'terms_and_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'shipping_and_return' => 'nullable|string',
        ]);

        $compliance->update([
            'title' => trim((string) ($validated['title'] ?? $compliance->title)),
            'terms_and_conditions' => $validated['terms_and_conditions'] ?? $compliance->terms_and_conditions,
            'privacy_policy' => $validated['privacy_policy'] ?? $compliance->privacy_policy,
            'shipping_and_return' => $validated['shipping_and_return'] ?? $compliance->shipping_and_return,
        ]);

        return response()->json($compliance->fresh());
    }

    public function destroy(CompliancePage $compliance): JsonResponse
    {
        $compliance->delete();

        return response()->json(['message' => 'Compliance page deleted successfully']);
    }
}