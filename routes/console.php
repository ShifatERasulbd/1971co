<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('products:sync-inventory')
    ->everyTenMinutes()
    ->withoutOverlapping();

// Makes copies of newly uploaded catalogue photos before anyone opens the catalogue
// (only checks file dates when nothing has changed)
Schedule::command('catalog:cache-images')
    ->everyTenMinutes()
    ->withoutOverlapping();
