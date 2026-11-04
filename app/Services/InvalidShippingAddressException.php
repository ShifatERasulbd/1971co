<?php

namespace App\Services;

class InvalidShippingAddressException extends \RuntimeException
{
    public function __construct(string $message = 'Please use a valid address.')
    {
        parent::__construct($message);
    }
}
