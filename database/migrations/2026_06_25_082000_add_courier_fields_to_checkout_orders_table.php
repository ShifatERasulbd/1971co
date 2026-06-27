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
            if (! Schema::hasColumn('checkout_orders', 'courier_service')) {
                $table->string('courier_service')->nullable()->after('payment_intent_id');
            }

            if (! Schema::hasColumn('checkout_orders', 'courier_reference')) {
                $table->string('courier_reference')->nullable()->after('courier_service');
            }

            if (! Schema::hasColumn('checkout_orders', 'courier_sync_status')) {
                $table->string('courier_sync_status')->nullable()->after('courier_reference');
            }

            if (! Schema::hasColumn('checkout_orders', 'courier_sync_error')) {
                $table->text('courier_sync_error')->nullable()->after('courier_sync_status');
            }

            if (! Schema::hasColumn('checkout_orders', 'ups_tracking_number')) {
                $table->string('ups_tracking_number')->nullable()->after('courier_sync_error');
            }

            if (! Schema::hasColumn('checkout_orders', 'ups_synced_at')) {
                $table->timestamp('ups_synced_at')->nullable()->after('ups_tracking_number');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('checkout_orders', 'ups_synced_at') ? 'ups_synced_at' : null,
                Schema::hasColumn('checkout_orders', 'ups_tracking_number') ? 'ups_tracking_number' : null,
                Schema::hasColumn('checkout_orders', 'courier_sync_error') ? 'courier_sync_error' : null,
                Schema::hasColumn('checkout_orders', 'courier_sync_status') ? 'courier_sync_status' : null,
                Schema::hasColumn('checkout_orders', 'courier_reference') ? 'courier_reference' : null,
                Schema::hasColumn('checkout_orders', 'courier_service') ? 'courier_service' : null,
            ]);

            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
