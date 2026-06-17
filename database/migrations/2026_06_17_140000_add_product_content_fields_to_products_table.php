<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'fit')) {
                $table->longText('fit')->nullable()->after('description');
            }

            if (! Schema::hasColumn('products', 'fabric_and_care')) {
                $table->longText('fabric_and_care')->nullable()->after('fit');
            }

            if (! Schema::hasColumn('products', 'product_features')) {
                $table->longText('product_features')->nullable()->after('fabric_and_care');
            }

            if (! Schema::hasColumn('products', 'size_chart_image')) {
                $table->string('size_chart_image')->nullable()->after('cover_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('products', 'fit')) {
                $columns[] = 'fit';
            }

            if (Schema::hasColumn('products', 'fabric_and_care')) {
                $columns[] = 'fabric_and_care';
            }

            if (Schema::hasColumn('products', 'product_features')) {
                $columns[] = 'product_features';
            }

            if (Schema::hasColumn('products', 'size_chart_image')) {
                $columns[] = 'size_chart_image';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
