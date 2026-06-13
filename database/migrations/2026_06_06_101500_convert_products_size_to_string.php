<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE products MODIFY size VARCHAR(191) NULL');

        $rows = DB::table('products')->select('id', 'size')->get();
        foreach ($rows as $row) {
            $size = $row->size;
            $normalized = null;

            if (is_string($size)) {
                $trimmed = trim($size);
                if ($trimmed !== '') {
                    $decoded = json_decode($trimmed, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $first = $decoded[0] ?? null;
                        if (is_scalar($first) && trim((string) $first) !== '') {
                            $normalized = trim((string) $first);
                        }
                    } else {
                        $normalized = $trimmed;
                    }
                }
            }

            DB::table('products')->where('id', $row->id)->update(['size' => $normalized]);
        }
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE products MODIFY size JSON NULL');
    }
};
