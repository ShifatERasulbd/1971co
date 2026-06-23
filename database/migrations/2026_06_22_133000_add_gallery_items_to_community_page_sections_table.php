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
        Schema::table('community_page_sections', function (Blueprint $table) {
            if (!Schema::hasColumn('community_page_sections', 'gallery_items')) {
                $table->json('gallery_items')->nullable()->after('community_items');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_page_sections', function (Blueprint $table) {
            if (Schema::hasColumn('community_page_sections', 'gallery_items')) {
                $table->dropColumn('gallery_items');
            }
        });
    }
};
