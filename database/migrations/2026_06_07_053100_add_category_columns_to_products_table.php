<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'category_id')) {
                $table->unsignedBigInteger('category_id')->nullable()->after('cover_image');
            }

            if (! Schema::hasColumn('products', 'subcategory_id')) {
                $table->unsignedBigInteger('subcategory_id')->nullable()->after('category_id');
            }
        });
    }

    public function down(): void
        
    {
        Schema::table('products', function (Blueprint $table): void {
            $dropCandidates = [
                'subcategory_id',
                'category_id',
            ];

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
