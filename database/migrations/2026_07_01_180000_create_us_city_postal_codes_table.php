<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('us_city_postal_codes', function (Blueprint $table) {
            $table->id();
            $table->string('city', 120);
            $table->string('state_code', 2);
            $table->string('state_name', 120);
            $table->string('postal_code', 10);
            $table->timestamps();

            $table->index(['state_code', 'city']);
            $table->index('postal_code');
            $table->unique(['state_code', 'city', 'postal_code'], 'us_city_state_postal_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('us_city_postal_codes');
    }
};
