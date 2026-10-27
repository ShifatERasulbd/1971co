<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Log;

class NoMaliciousInput implements ValidationRule
{
    private const PATTERNS = [
        // Script / HTML injection (XSS)
        '/<\s*\/?\s*[a-z!][^>]*>/i',
        '/javascript\s*:/i',
        '/vbscript\s*:/i',
        '/data\s*:\s*text\/html/i',
        '/\bon[a-z]{3,20}\s*=/i',
        '/&#x?[0-9a-f]+;?/i',
        '/\\\\x[0-9a-f]{2}|\\\\u[0-9a-f]{4}/i',

        // SQL injection
        '/\bunion\b[\s\S]{0,20}\bselect\b/i',
        '/\b(or|and)\b\s+[\'"]?\d+[\'"]?\s*=\s*[\'"]?\d+/i',
        '/[\'"]\s*--/',
        '/;\s*(drop|alter|truncate|delete|insert|update|create)\b/i',
        '/\b(drop|truncate)\s+table\b/i',
        '/\b(sleep|benchmark)\s*\(/i',
        '/\binformation_schema\b/i',
        '/\bxp_cmdshell\b/i',
        '/\/\*|\*\//',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        foreach (self::PATTERNS as $pattern) {
            if (preg_match($pattern, $value)) {
                Log::warning('Blocked suspicious wholesale form input', [
                    'field' => $attribute,
                    'ip' => request()->ip(),
                    'sample' => mb_substr($value, 0, 120),
                ]);

                $fail('The :attribute contains characters or patterns that are not allowed.');

                return;
            }
        }
    }
}