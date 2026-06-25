<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('products')) {
            return;
        }

        if (!Schema::hasColumn('products', 'position')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->unsignedInteger('position')->nullable();
            });
        }

        $ids = DB::table('products')
            ->orderBy('id')
            ->pluck('id');

        foreach ($ids as $index => $id) {
            DB::table('products')
                ->where('id', $id)
                ->update(['position' => $index + 1]);
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('products') || !Schema::hasColumn('products', 'position')) {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('position');
        });
    }
};
