<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWholesaleApplicationRequest;
use App\Mail\WholesaleApplicationMail;
use App\Models\WholesaleApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class WholesaleApplicationController extends Controller
{
    public function store(StoreWholesaleApplicationRequest $request): JsonResponse
    {
        $v = $request->validated();

        // 1. Save to the database first
        $application = WholesaleApplication::create([
            'company_legal_name'  => $v['companyLegalName'],
            'dba'                 => $v['dba'] ?? null,
            'owner_name'          => $v['ownerName'],
            'website'             => $v['website'] ?? null,

            'contact_name'        => $v['contactName'],
            'contact_designation' => $v['contactDesignation'] ?? null,
            'contact_email'       => mb_strtolower($v['contactEmail']),
            'contact_phone'       => $v['contactPhone'] ?? null,

            'street_address'      => $v['streetAddress'],
            'city'                => $v['city'],
            'state'               => $v['state'],

            'primary_goods'       => $v['primaryGoods'],
            'years_in_business'   => $v['yearsInBusiness'],
            'physical_stores'     => $v['physicalStores'] ?? null,
            'projected_year_1'    => $v['projectedYear1'],
            'projected_year_2'    => $v['projectedYear2'],
            'projected_year_3'    => $v['projectedYear3'],
            'store_description'   => $v['storeDescription'],

            'ip_address'          => $request->ip(),
            'user_agent'          => $request->userAgent() ? Str::limit($request->userAgent(), 250, '') : null,
        ]);

        // 2. Email all recipients AFTER the response is sent, so the visitor never waits
        //    on SMTP and a mail failure can never break the form.
        dispatch(function () use ($application) {
            try {
                Mail::send(new WholesaleApplicationMail($application));
            } catch (Throwable $e) {
                Log::error('Wholesale application email failed', [
                    'application_id' => $application->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        })->afterResponse();

        return response()->json(['message' => 'Thank you! Your wholesale inquiry has been received.'], 201);
    }
}