<?php

namespace App\Http\Controllers;

use App\Models\Color;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ColorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Color::orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', Rule::unique('colors', 'name')],
            'color_code' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/', Rule::unique('colors', 'color_code')],
        ]);

        $validated['name'] = trim($validated['name']);
        $validated['color_code'] = strtoupper($validated['color_code']);

        $color = Color::create($validated);

        return response()->json($color, 201);
    }

    public function show(Color $color): JsonResponse
    {
        return response()->json($color);
    }

    public function update(Request $request, Color $color): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('colors', 'name')->ignore($color->id),
            ],
            'color_code' => [
                'required',
                'string',
                'regex:/^#[0-9A-Fa-f]{6}$/',
                Rule::unique('colors', 'color_code')->ignore($color->id),
            ],
        ]);

        $validated['name'] = trim($validated['name']);
        $validated['color_code'] = strtoupper($validated['color_code']);

        $color->update($validated);

        return response()->json($color->fresh());
    }

    public function destroy(Color $color): JsonResponse
    {
        $color->delete();

        return response()->json(['message' => 'Color deleted successfully']);
    }
}
