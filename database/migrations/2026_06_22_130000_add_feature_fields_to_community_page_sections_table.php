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
            if (!Schema::hasColumn('community_page_sections', 'feature_image')) {
                $table->string('feature_image')->nullable()->after('button_url');
            }

            if (!Schema::hasColumn('community_page_sections', 'feature_items')) {
                $table->json('feature_items')->nullable()->after('feature_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_page_sections', function (Blueprint $table) {
            if (Schema::hasColumn('community_page_sections', 'feature_items')) {
                $table->dropColumn('feature_items');
            }

            if (Schema::hasColumn('community_page_sections', 'feature_image')) {
                $table->dropColumn('feature_image');
            }
        });
    }
};
