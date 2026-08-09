<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('checkout_orders', 'delivery_cost')) {
                $table->decimal('delivery_cost', 12, 2)->default(0)->after('shipping');
            }

            if (! Schema::hasColumn('checkout_orders', 'state_tax')) {
                $table->decimal('state_tax', 12, 2)->default(0)->after('delivery_cost');
            }

            if (! Schema::hasColumn('checkout_orders', 'processing_fee')) {
                $table->decimal('processing_fee', 12, 2)->default(0)->after('state_tax');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table): void {
            $columns = array_filter([
                Schema::hasColumn('checkout_orders', 'processing_fee') ? 'processing_fee' : null,
                Schema::hasColumn('checkout_orders', 'state_tax') ? 'state_tax' : null,
                Schema::hasColumn('checkout_orders', 'delivery_cost') ? 'delivery_cost' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
