<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'color_variant_videos')) {
                $table->json('color_variant_videos')->nullable()->after('color_variant_images');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'color_variant_videos')) {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('color_variant_videos');
        });
    }
};
