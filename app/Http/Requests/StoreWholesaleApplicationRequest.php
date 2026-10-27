<?php

namespace App\Http\Requests;

use App\Rules\NoMaliciousInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWholesaleApplicationRequest extends FormRequest
{
    // Must match the dropdown options in the React form
    private const YEARS = ['Not opened yet', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '>10'];
    private const STORES = ['Online Only', '1-5', '6-10', '11+'];
    private const BOOKINGS = [
        '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $15,000',
        '$15,000 - $20,000', '$20,000 - $25,000', '$25,000+',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $person = ['required', 'string', 'min:2', 'max:100', "regex:/^[\pL\pM\s.'’\-]+$/u", new NoMaliciousInput];

        return [
            'companyLegalName'   => ['required', 'string', 'max:150', new NoMaliciousInput],
            'dba'                => ['nullable', 'string', 'max:150', new NoMaliciousInput],
            'ownerName'          => $person,
            'website'            => ['nullable', 'string', 'max:200', new NoMaliciousInput],

            'contactName'        => $person,
            'contactDesignation' => ['nullable', 'string', 'max:100', new NoMaliciousInput],
            'contactEmail'       => ['required', 'string', 'email:rfc', 'max:150', new NoMaliciousInput],
            'contactPhone'       => ['nullable', 'string', 'regex:/^[0-9+()\-.\s]{6,30}$/'],

            'streetAddress'      => ['required', 'string', 'max:200', new NoMaliciousInput],
            'city'               => ['required', 'string', 'max:100', new NoMaliciousInput],
            'state'              => ['required', 'string', 'max:100', new NoMaliciousInput],

            'primaryGoods'       => ['required', 'string', 'max:200', new NoMaliciousInput],
            'yearsInBusiness'    => ['required', Rule::in(self::YEARS)],
            'physicalStores'     => ['nullable', Rule::in(self::STORES)],
            'projectedYear1'     => ['required', Rule::in(self::BOOKINGS)],
            'projectedYear2'     => ['required', Rule::in(self::BOOKINGS)],
            'projectedYear3'     => ['required', Rule::in(self::BOOKINGS)],
            'storeDescription'   => ['required', 'string', 'min:10', 'max:2000', new NoMaliciousInput],
        ];
    }

    public function messages(): array
    {
        return [
            'ownerName.regex'   => "Owner's name may only contain letters, spaces, and . ' -",
            'contactName.regex' => "Contact name may only contain letters, spaces, and . ' -",
        ];
    }
}