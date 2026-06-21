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
            if (! Schema::hasColumn('checkout_orders', 'payment_provider')) {
                $table->string('payment_provider')->nullable()->after('items');
            }

            if (! Schema::hasColumn('checkout_orders', 'payment_status')) {
                $table->string('payment_status')->nullable()->after('payment_provider');
            }

            if (! Schema::hasColumn('checkout_orders', 'payment_intent_id')) {
                $table->string('payment_intent_id')->nullable()->unique()->after('payment_status');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table) {
            if (Schema::hasColumn('checkout_orders', 'payment_intent_id')) {
                $table->dropUnique(['payment_intent_id']);
            }

            $columnsToDrop = array_values(array_filter([
                Schema::hasColumn('checkout_orders', 'payment_provider') ? 'payment_provider' : null,
                Schema::hasColumn('checkout_orders', 'payment_status') ? 'payment_status' : null,
                Schema::hasColumn('checkout_orders', 'payment_intent_id') ? 'payment_intent_id' : null,
            ]));

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
