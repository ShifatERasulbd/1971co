<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('checkout_orders', 'shipstation_order_id')) {
                $table->string('shipstation_order_id')->nullable()->after('payment_intent_id');
            }

            if (! Schema::hasColumn('checkout_orders', 'shipstation_synced_at')) {
                $table->timestamp('shipstation_synced_at')->nullable()->after('shipstation_order_id');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table) {
            if (Schema::hasColumn('checkout_orders', 'shipstation_synced_at')) {
                $table->dropColumn('shipstation_synced_at');
            }

            if (Schema::hasColumn('checkout_orders', 'shipstation_order_id')) {
                $table->dropColumn('shipstation_order_id');
            }
        });
    }
};
