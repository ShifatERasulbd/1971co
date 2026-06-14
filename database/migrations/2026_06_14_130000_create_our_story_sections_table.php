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
        Schema::create('our_story_sections', function (Blueprint $table) {
            $table->id();
            $table->text('story_image')->nullable();
            $table->text('story_logo')->nullable();
            $table->string('section_title')->default('Our Story');
            $table->string('title')->default('Heritage, Refined.');
            $table->text('description')->nullable();
            $table->string('background_color', 20)->default('#c8b89a');
            $table->boolean('show_image')->default(true);
            $table->boolean('show_text')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('our_story_sections');
    }
};
