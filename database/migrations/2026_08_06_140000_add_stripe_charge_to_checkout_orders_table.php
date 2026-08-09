<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('checkout_orders', 'stripe_charge')) {
                $table->decimal('stripe_charge', 12, 2)->default(0)->after('state_tax');
            }
        });

        if (Schema::hasColumn('checkout_orders', 'stripe_charge')) {
            DB::table('checkout_orders')
                ->update([
                    'stripe_charge' => DB::raw('ROUND(((COALESCE(subtotal, 0) + COALESCE(shipping, 0) + COALESCE(state_tax, 0)) * 0.029) + 0.30, 2)'),
                ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table): void {
            if (Schema::hasColumn('checkout_orders', 'stripe_charge')) {
                $table->dropColumn('stripe_charge');
            }
        });
    }
};
