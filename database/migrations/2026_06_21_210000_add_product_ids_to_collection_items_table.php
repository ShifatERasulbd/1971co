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
        Schema::table('collection_items', function (Blueprint $table) {
            if (!Schema::hasColumn('collection_items', 'product_ids')) {
                $table->json('product_ids')->nullable()->after('image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('collection_items', function (Blueprint $table) {
            if (Schema::hasColumn('collection_items', 'product_ids')) {
                $table->dropColumn('product_ids');
            }
        });
    }
};
