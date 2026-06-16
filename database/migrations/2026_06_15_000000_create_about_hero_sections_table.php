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
        Schema::create('about_hero_sections', function (Blueprint $table) {
            $table->id();
            $table->string('background_image')->nullable();
            $table->string('section_title')->default('Our Story');
            $table->string('title')->default('Heritage. Culture. Style.');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_hero_sections');
    }
};
