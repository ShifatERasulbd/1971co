<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'long_description')) {
                $table->longText('long_description')->nullable()->after('description');
            }

            if (! Schema::hasColumn('products', 'additional_information')) {
                $table->longText('additional_information')->nullable()->after('long_description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $dropCandidates = [
                'additional_information',
                'long_description',
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
