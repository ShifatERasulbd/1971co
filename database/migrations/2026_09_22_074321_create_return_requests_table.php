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
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();
            $table->string('order_number');
            $table->string('request_reason');
            $table->text('additional_text')->nullable();
            $table->string('uploaded_document')->nullable(); // Stores file path
            $table->string('wants_size_replacement', 3)->nullable(); // 'yes' or 'no'
            $table->json('item_size_replacements')->nullable(); // Stores size choices per ite
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};
