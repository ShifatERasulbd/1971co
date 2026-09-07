<?php

namespace App\Http\Controllers;

use App\Models\UsCityPostalCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsLocationController extends Controller
{
    public function states(): JsonResponse
    {
        $states = UsCityPostalCode::query()
            ->select(['state_code', 'state_name'])
            ->distinct()
            ->orderBy('state_name')
            ->get()
            ->map(static fn (UsCityPostalCode $row): array => [
                'state_code' => $row->state_code,
                'state_name' => $row->state_name,
            ])
            ->values();

        return response()->json($states);
    }

    public function citiesByState(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state' => 'required|string|max:120',
        ]);

        $state = trim((string) $validated['state']);
        $stateCode = strtoupper($state);

        $query = UsCityPostalCode::query()->select('city')->distinct();

        if (strlen($stateCode) === 2) {
            $query->where('state_code', $stateCode);
        } else {
            $query->whereRaw('LOWER(state_name) = ?', [mb_strtolower($state)]);
        }

        $cities = $query
            ->orderBy('city')
            ->pluck('city')
            ->values();

        return response()->json($cities);
    }

    public function postalCodeByCityState(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city' => 'required|string|max:120',
            'state' => 'required|string|max:120',
        ]);

        $city = trim((string) $validated['city']);
        $state = trim((string) $validated['state']);
        $stateCode = strtoupper($state);

        $query = UsCityPostalCode::query()
            ->whereRaw('LOWER(city) = ?', [mb_strtolower($city)]);

        if (strlen($stateCode) === 2) {
            $query->where('state_code', $stateCode);
        } else {
            $query->whereRaw('LOWER(state_name) = ?', [mb_strtolower($state)]);
        }

        $record = $query
            ->orderBy('postal_code')
            ->first(['city', 'state_code', 'state_name', 'postal_code']);

        if (! $record) {
            return response()->json([
                'message' => 'No postal code found for the provided city/state.',
            ], 404);
        }

        return response()->json([
            'city' => $record->city,
            'state_code' => $record->state_code,
            'state_name' => $record->state_name,
            'postal_code' => $record->postal_code,
        ]);
    }
}
