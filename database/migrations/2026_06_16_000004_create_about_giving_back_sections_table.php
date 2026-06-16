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
        Schema::create('about_giving_back_sections', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('section_title')->default('Giving Back');
            $table->string('title')->default('Roots Run Deep.');
            $table->text('description')->nullable();
            $table->json('points')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_giving_back_sections');
    }
};
