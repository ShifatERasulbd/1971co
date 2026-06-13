<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('features', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->nullable()->after('icon');
            $table->unsignedSmallInteger('title_font_size')->nullable()->after('sort_order');
            $table->string('title_font_family', 100)->nullable()->after('title_font_size');
            $table->unsignedSmallInteger('description_font_size')->nullable()->after('title_font_family');
            $table->string('description_font_family', 100)->nullable()->after('description_font_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('features', function (Blueprint $table) {
            $table->dropColumn([
                'sort_order',
                'title_font_size',
                'title_font_family',
                'description_font_size',
                'description_font_family',
            ]);
        });
    }
};
