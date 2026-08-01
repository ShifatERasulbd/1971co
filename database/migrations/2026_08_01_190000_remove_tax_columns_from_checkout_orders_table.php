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
            $columns = array_filter([
                Schema::hasColumn('checkout_orders', 'tax_details') ? 'tax_details' : null,
                Schema::hasColumn('checkout_orders', 'tax_rate') ? 'tax_rate' : null,
                Schema::hasColumn('checkout_orders', 'tax') ? 'tax' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('checkout_orders')) {
            return;
        }

        Schema::table('checkout_orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('checkout_orders', 'tax')) {
                $table->decimal('tax', 12, 2)->default(0)->after('shipping');
            }

            if (! Schema::hasColumn('checkout_orders', 'tax_rate')) {
                $table->decimal('tax_rate', 10, 6)->default(0)->after('tax');
            }

            if (! Schema::hasColumn('checkout_orders', 'tax_details')) {
                $table->json('tax_details')->nullable()->after('tax_rate');
            }
        });
    }
};
