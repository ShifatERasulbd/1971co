<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
class SizeController extends Controller
{
     public function index():JsonResponse
    {
        return response()->json(Size::orderBy('size')->get());
    }

    public function store(Request $request):JsonResponse
    {
        $validated = $request->validate([
            'size' => ['required', 'string', 'max:20', Rule::unique('sizes', 'size')],
        ]);

        $validated['size'] = trim($validated['size']);

        $size = Size::create($validated);
        return response()->json($size, 201);
    }

    public function show(Size $size): JsonResponse
    {
        return response()->json($size);
    }

    public function update(Request $request, Size $size): JsonResponse
    {
        $validated = $request->validate([
            'size' => [
                'required',
                'string',
                'max:20',
                Rule::unique('sizes', 'size')->ignore($size->id),
            ],
        ]);

        $validated['size'] = trim($validated['size']);

        $size->update($validated);
        return response()->json($size->fresh());
    }

    public function destroy(Size $size):JsonResponse
    {
        $size->delete();
        return response()->json(['message' => 'Size Deleted Successfully']);
    }
}
