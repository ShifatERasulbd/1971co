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
            if (!Schema::hasColumn('community_page_sections', 'community_image')) {
                $table->string('community_image')->nullable()->after('feature_items');
            }

            if (!Schema::hasColumn('community_page_sections', 'community_items')) {
                $table->json('community_items')->nullable()->after('community_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_page_sections', function (Blueprint $table) {
            if (Schema::hasColumn('community_page_sections', 'community_items')) {
                $table->dropColumn('community_items');
            }

            if (Schema::hasColumn('community_page_sections', 'community_image')) {
                $table->dropColumn('community_image');
            }
        });
    }
};
