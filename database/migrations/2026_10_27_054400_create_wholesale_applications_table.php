<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wholesale_applications', function (Blueprint $table) {
            $table->id();
          // Company
        $table->string('company_legal_name', 150);
        $table->string('dba', 150)->nullable();
        $table->string('owner_name', 100);
        $table->string('website', 200)->nullable();

        // Primary contact
        $table->string('contact_name', 100);
        $table->string('contact_designation', 100)->nullable();
        $table->string('contact_email', 150);
        $table->string('contact_phone', 30)->nullable();

        // Business location
        $table->string('street_address', 200);
        $table->string('city', 100);
        $table->string('state', 100);

        // Business
        $table->string('primary_goods', 200);
        $table->string('years_in_business', 20);
        $table->string('physical_stores', 20)->nullable();
        $table->string('projected_year_1', 30);
        $table->string('projected_year_2', 30);
        $table->string('projected_year_3', 30);
        $table->text('store_description');

        $table->string('status', 20)->default('new'); // new / approved / rejected
        $table->string('ip_address', 45)->nullable();
        $table->string('user_agent', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wholesale_applications');
    }
};
