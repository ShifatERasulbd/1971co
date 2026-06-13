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
        Schema::table('personalizations', function (Blueprint $table) {
            if (!Schema::hasColumn('personalizations', 'front_image_path')) {
                $table->string('front_image_path')->nullable()->after('image_path');
            }

            if (!Schema::hasColumn('personalizations', 'back_image_path')) {
                $table->string('back_image_path')->nullable()->after('front_image_path');
            }

            if (!Schema::hasColumn('personalizations', 'quantity')) {
                $table->unsignedInteger('quantity')->default(1)->after('back_image_path');
            }

            if (!Schema::hasColumn('personalizations', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0)->after('quantity');
            }

            if (!Schema::hasColumn('personalizations', 'total_price')) {
                $table->decimal('total_price', 10, 2)->default(0)->after('unit_price');
            }

            if (!Schema::hasColumn('personalizations', 'order_status')) {
                $table->string('order_status', 50)->default('pending')->after('total_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personalizations', function (Blueprint $table) {
            if (Schema::hasColumn('personalizations', 'order_status')) {
                $table->dropColumn('order_status');
            }

            if (Schema::hasColumn('personalizations', 'total_price')) {
                $table->dropColumn('total_price');
            }

            if (Schema::hasColumn('personalizations', 'unit_price')) {
                $table->dropColumn('unit_price');
            }

            if (Schema::hasColumn('personalizations', 'quantity')) {
                $table->dropColumn('quantity');
            }

            if (Schema::hasColumn('personalizations', 'back_image_path')) {
                $table->dropColumn('back_image_path');
            }

            if (Schema::hasColumn('personalizations', 'front_image_path')) {
                $table->dropColumn('front_image_path');
            }
        });
    }
};
