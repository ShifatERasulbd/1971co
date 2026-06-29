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
        Schema::table('home_background_sections', function (Blueprint $table) {
            if (! Schema::hasColumn('home_background_sections', 'items')) {
                $table->json('items')->nullable()->after('background_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_background_sections', function (Blueprint $table) {
            if (Schema::hasColumn('home_background_sections', 'items')) {
                $table->dropColumn('items');
            }
        });
    }
};
