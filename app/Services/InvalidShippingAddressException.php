<?php

namespace App\Services;

class InvalidShippingAddressException extends \RuntimeException
{
    public function __construct(string $message = 'Please correct the address. Check your street address, city, state and ZIP code.')
    {
        parent::__construct($message);
    }
}
