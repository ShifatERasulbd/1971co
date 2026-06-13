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
        Schema::table('heroes', function (Blueprint $table) {
            $table->smallInteger('text_offset_x')->nullable()->after('description_font_family');
            $table->smallInteger('text_offset_y')->nullable()->after('text_offset_x');

            $table->smallInteger('title_offset_x')->nullable()->after('text_offset_y');
            $table->smallInteger('title_offset_y')->nullable()->after('title_offset_x');

            $table->smallInteger('description_offset_x')->nullable()->after('title_offset_y');
            $table->smallInteger('description_offset_y')->nullable()->after('description_offset_x');

            $table->smallInteger('button_offset_x')->nullable()->after('description_offset_y');
            $table->smallInteger('button_offset_y')->nullable()->after('button_offset_x');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->dropColumn([
                'text_offset_x',
                'text_offset_y',
                'title_offset_x',
                'title_offset_y',
                'description_offset_x',
                'description_offset_y',
                'button_offset_x',
                'button_offset_y',
            ]);
        });
    }
};
