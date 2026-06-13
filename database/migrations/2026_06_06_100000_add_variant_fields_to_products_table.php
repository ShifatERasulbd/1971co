<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'price')) {
                $table->decimal('price', 10, 2)->default(0);
            }

            if (! Schema::hasColumn('products', 'barcode')) {
                $table->string('barcode', 191)->nullable();
            }

            if (! Schema::hasColumn('products', 'color')) {
                $table->json('color')->nullable();
            }

            if (! Schema::hasColumn('products', 'size')) {
                $table->json('size')->nullable();
            }

            if (! Schema::hasColumn('products', 'available_products')) {
                $table->json('available_products')->nullable();
            }

            if (! Schema::hasColumn('products', 'cover_image')) {
                $table->string('cover_image')->nullable();
            }

            if (! Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $dropCandidates = [
                'description',
                'cover_image',
                'available_products',
                'size',
                'color',
                'barcode',
                'price',
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
