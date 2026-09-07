<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('checkout_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('checkout_orders', 'residential')) {
                $table->boolean('residential')->default(false)->after('country');
            }
            if (! Schema::hasColumn('checkout_orders', 'delivery_cost')) {
                $table->decimal('delivery_cost', 12, 2)->default(0)->after('shipping');
            }
            if (! Schema::hasColumn('checkout_orders', 'state_tax')) {
                $table->decimal('state_tax', 12, 2)->default(0)->after('delivery_cost');
            }
            if (! Schema::hasColumn('checkout_orders', 'stripe_charge')) {
                $table->decimal('stripe_charge', 12, 2)->default(0)->after('state_tax');
            }
            if (! Schema::hasColumn('checkout_orders', 'processing_fee')) {
                $table->decimal('processing_fee', 12, 2)->default(0)->after('stripe_charge');
            }
        });
    }

    public function down(): void
    {
        Schema::table('checkout_orders', function (Blueprint $table) {
            $table->dropColumn([
                'residential',
                'delivery_cost',
                'state_tax',
                'stripe_charge',
                'processing_fee',
            ]);
        });
    }
};
