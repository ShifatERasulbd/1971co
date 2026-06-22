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
        Schema::table('community_page_sections', function (Blueprint $table) {
            $table->string('content_title')->nullable()->after('description');
            $table->text('heading')->nullable()->after('content_title');
            $table->text('section_description')->nullable()->after('heading');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_page_sections', function (Blueprint $table) {
            $table->dropColumn(['content_title', 'heading', 'section_description']);
        });
    }
};
