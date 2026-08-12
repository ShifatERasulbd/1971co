<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $this->addUpsColumns('retail_sales');
        $this->addUpsColumns('checkout_orders');
    }

    public function down(): void
    {
        $this->dropUpsColumns('retail_sales');
        $this->dropUpsColumns('checkout_orders');
    }

    protected function addUpsColumns(string $tableName): void
    {
        if (! Schema::hasTable($tableName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($tableName) {
            if (! Schema::hasColumn($tableName, 'ups_status')) {
                $table->string('ups_status')->nullable();
            }

            if (! Schema::hasColumn($tableName, 'ups_status_code')) {
                $table->string('ups_status_code', 50)->nullable();
            }

            if (! Schema::hasColumn($tableName, 'ups_status_message')) {
                $table->text('ups_status_message')->nullable();
            }

            if (! Schema::hasColumn($tableName, 'ups_error_response')) {
                $table->longText('ups_error_response')->nullable();
            }
        });
    }

    protected function dropUpsColumns(string $tableName): void
    {
        if (! Schema::hasTable($tableName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($tableName) {
            $columns = array_filter([
                Schema::hasColumn($tableName, 'ups_error_response') ? 'ups_error_response' : null,
                Schema::hasColumn($tableName, 'ups_status_message') ? 'ups_status_message' : null,
                Schema::hasColumn($tableName, 'ups_status_code') ? 'ups_status_code' : null,
                Schema::hasColumn($tableName, 'ups_status') ? 'ups_status' : null,
            ]);

            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
