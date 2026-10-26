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
        Schema::table('products', function (Blueprint $table) {
             $table->string('catalog_thumb_image', 2048)->nullable()->after('cover_image');
            $table->json('catalog_feature_images')->nullable()->after('catalog_thumb_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
             $table->dropColumn(['catalog_thumb_image', 'catalog_feature_images']);
        });
    }
};
