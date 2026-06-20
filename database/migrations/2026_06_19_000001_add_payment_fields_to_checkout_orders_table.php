<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('checkout_orders', function (Blueprint $table) {
            $table->string('payment_provider')->nullable()->after('items');
            $table->string('payment_status')->nullable()->after('payment_provider');
            $table->string('payment_intent_id')->nullable()->unique()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('checkout_orders', function (Blueprint $table) {
            $table->dropUnique(['payment_intent_id']);
            $table->dropColumn(['payment_provider', 'payment_status', 'payment_intent_id']);
        });
    }
};
