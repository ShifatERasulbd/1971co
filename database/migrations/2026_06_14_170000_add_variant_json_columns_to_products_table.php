<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'variant_rows')) {
                $table->json('variant_rows')->nullable()->after('image_gallery');
            }

            if (! Schema::hasColumn('products', 'color_variant_images')) {
                $table->json('color_variant_images')->nullable()->after('variant_rows');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $dropCandidates = ['color_variant_images', 'variant_rows'];

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
