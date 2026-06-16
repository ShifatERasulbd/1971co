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
        Schema::create('about_story_sections', function (Blueprint $table) {
            $table->id();
            $table->string('background_image')->nullable();
            $table->string('section_title')->default('The Beginning');
            $table->string('title')->default('Why 1971?');
            $table->longText('description_html')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_story_sections');
    }
};
