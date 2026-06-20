<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeController extends Controller
{
    public function publicConfig(): JsonResponse
    {
        $publishableKey = (string) config('services.stripe.key');

        return response()->json([
            'configured' => $publishableKey !== '',
            'publishableKey' => $publishableKey,
        ]);
    }

    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.5',
            'currency' => 'nullable|string|size:3',
        ]);

        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            return response()->json([
                'message' => 'Stripe secret key is not configured.',
            ], 500);
        }

        $amountInCents = (int) round(((float) $validated['amount']) * 100);
        $currency = strtolower((string) ($validated['currency'] ?? 'usd'));

        try {
            Stripe::setApiKey($secretKey);

            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (ApiErrorException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
