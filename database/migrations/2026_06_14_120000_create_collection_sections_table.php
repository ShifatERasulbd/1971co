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
        Schema::create('collection_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('Collections');
            $table->string('title_position', 20)->default('left');
            $table->unsignedTinyInteger('items_per_view')->default(4);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_sections');
    }
};
