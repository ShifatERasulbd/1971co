<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function handleGoogleCallback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => 'required|string',
        ]);

        $clientId = (string) config('services.google.client_id');
        if ($clientId === '') {
            return response()->json(['message' => 'Google login is not configured.'], 500);
        }

        // Verify the ID token via Google's tokeninfo endpoint
        // SSL verification is disabled on local because XAMPP ships without a trusted CA bundle
        $http = app()->isLocal() ? Http::withoutVerifying() : Http::new();
        $tokenResponse = $http->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $validated['credential'],
        ]);

        if (!$tokenResponse->successful()) {
            return response()->json(['message' => 'Invalid Google token.'], 422);
        }

        $tokenData = $tokenResponse->json();

        // Validate the audience claim to prevent token substitution attacks
        if (($tokenData['aud'] ?? '') !== $clientId) {
            return response()->json(['message' => 'Token audience mismatch.'], 422);
        }

        $email = $tokenData['email'] ?? null;
        $googleId = $tokenData['sub'] ?? null;
        $name = trim(($tokenData['given_name'] ?? '') . ' ' . ($tokenData['family_name'] ?? ''));
        $firstName = $tokenData['given_name'] ?? '';
        $lastName = $tokenData['family_name'] ?? '';

        if (!$email || !$googleId) {
            return response()->json(['message' => 'Could not retrieve account details from Google.'], 422);
        }

        $user = User::updateOrCreate(
            ['email' => strtolower(trim($email))],
            [
                'google_id' => $googleId,
                'name' => $name ?: $email,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'user_type' => 'customer',
                // Only set a random password on first creation (won't overwrite existing)
                'password' => User::where('email', strtolower(trim($email)))->exists()
                    ? User::where('email', strtolower(trim($email)))->value('password')
                    : bcrypt(Str::random(32)),
            ]
        );

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
        ]);
    }
}