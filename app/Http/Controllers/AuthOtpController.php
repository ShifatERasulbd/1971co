<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\OtpMail;

class AuthOtpController extends Controller
{
    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255'],
            'remember' => ['boolean'],
        ]);

        $email = strtolower(trim($validated['email']));
        
        $user = User::firstOrNew(['email' => $email]);
        
        // Check if an OTP was already generated recently (e.g., within the last 60 seconds)
        $isResend = $user->exists && $user->otp && $user->updated_at && $user->updated_at->diffInSeconds(now()) < 60;

        if (!$user->exists) {
            $user->name = explode('@', $email)[0];
            $user->password = bcrypt(Str::random(32));
        }

        $otp = random_int(100000, 999999);
        $user->otp = (string) $otp;
        $user->save();

        Mail::to($email)->send(new OtpMail((string) $otp));

        $message = $isResend 
            ? 'New verification code sent to your email.' 
            : 'Verification code sent to your email.';

        return response()->json([
            'message' => $message
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string', 'size:6'],
            'remember' => ['boolean'],
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        // Validate OTP from the user database record
        if (!$user || empty($user->otp) || (int) $user->otp !== (int) $validated['otp']) {
            return response()->json([
                'message' => 'Invalid or expired verification code.'
            ], 422);
        }

        // Clear the OTP so it cannot be reused
        $user->otp = null;
        $user->save();

        $remember = $request->boolean('remember', false);

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'message' => 'Authenticated successfully.'
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }
}