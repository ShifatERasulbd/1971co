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
            if (! Schema::hasColumn('products', 'size_chart_images')) {
                $table->json('size_chart_images')->nullable()->after('size_chart_image');
            }

            if (! Schema::hasColumn('products', 'color_variant_size_charts')) {
                $table->json('color_variant_size_charts')->nullable()->after('color_variant_videos');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $dropCandidates = ['color_variant_size_charts', 'size_chart_images'];

            $droppable = array_values(array_filter(
                $dropCandidates,
                static fn (string $column): bool => Schema::hasColumn('products', $column),
            ));

            if ($droppable !== []) {
                $table->dropColumn($droppable);
            }
        });
    }
};
