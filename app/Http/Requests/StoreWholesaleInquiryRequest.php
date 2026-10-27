<?php

namespace App\Http\Requests;

use App\Rules\NoMaliciousInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWholesaleInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Clean the input before it is validated
    protected function prepareForValidation(): void
    {
        $clean = fn ($v) => is_string($v)
            ? trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v))
            : $v;

        // Single-line fields: no line breaks in names and contact details.
        $singleLine = fn ($v) => is_string($v)
            ? trim(preg_replace('/\s+/u', ' ', $clean($v)))
            : $v;

        $this->merge([
            'name' => $singleLine($this->input('name')),
            'email' => is_string($this->input('email')) ? mb_strtolower($singleLine($this->input('email'))) : null,
            'phone' => $singleLine($this->input('phone')),
            'category' => $singleLine($this->input('category')),
            'subject' => $singleLine($this->input('subject')),
            'message' => $clean($this->input('message')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100', "regex:/^[\pL\pM\s.'’\-]+$/u", new NoMaliciousInput],
            'email' => ['required', 'string', 'email:rfc', 'max:150', new NoMaliciousInput],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+()\-.\s]{6,30}$/'],
            'category' => ['nullable', 'string', Rule::in(config('wholesale.categories'))],
            'subject' => ['nullable', 'string', 'max:150', new NoMaliciousInput],
            'message' => ['required', 'string', 'min:10', 'max:3000', new NoMaliciousInput],
            'attachment' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'], // 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Name may only contain letters, spaces, and . \' -',
            'phone.regex' => 'Enter a valid phone number.',
            'attachment.mimes' => 'Only PDF or DOC files are accepted.',
            'attachment.max' => 'The file must be 5MB or smaller.',
        ];
    }
}