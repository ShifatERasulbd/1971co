<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('grand_childs')) {
            return;
        }

        Schema::table('grand_childs', function (Blueprint $table) {
            if (!Schema::hasColumn('grand_childs', 'position')) {
                $table->unsignedInteger('position')->default(0)->index();
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('grand_childs')) {
            return;
        }

        Schema::table('grand_childs', function (Blueprint $table) {
            if (Schema::hasColumn('grand_childs', 'position')) {
                $table->dropColumn('position');
            }
        });
    }
};
