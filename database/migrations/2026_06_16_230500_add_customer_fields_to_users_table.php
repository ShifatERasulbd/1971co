<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('user_type')->default('customer')->after('password')->index();
        });

        DB::table('users')->orderBy('id')->chunkById(200, function ($users) {
            foreach ($users as $user) {
                $name = trim((string) ($user->name ?? ''));
                $first = '';
                $last = '';

                if ($name !== '') {
                    $parts = preg_split('/\s+/', $name);
                    $first = (string) ($parts[0] ?? '');
                    $last = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'first_name' => $first,
                        'last_name' => $last,
                        'user_type' => 'admin',
                    ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'user_type']);
        });
    }
};
