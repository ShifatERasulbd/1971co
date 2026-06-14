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
        Schema::create('grand_childs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('sub_category_id')
                ->constrained('sub_categories')
                ->onDelete('cascade');
            $table->string('slug')->unique();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->onDelete('set null');
            $table->timestamp('soft_deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grand_childs');
    }
};
