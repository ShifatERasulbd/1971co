<?php

namespace Database\Seeders;

use App\Models\UsCityPostalCode;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class UsCityPostalCodeSeeder extends Seeder
{
    private const DATASET_URL = 'https://raw.githubusercontent.com/millbj92/US-Zip-Codes-JSON/master/USCities.json';
    private const LOCAL_DATASET_PATH = 'database/data/us_cities.json';

    private const STATE_NAME_BY_CODE = [
        'AL' => 'Alabama',
        'AK' => 'Alaska',
        'AZ' => 'Arizona',
        'AR' => 'Arkansas',
        'CA' => 'California',
        'CO' => 'Colorado',
        'CT' => 'Connecticut',
        'DE' => 'Delaware',
        'FL' => 'Florida',
        'GA' => 'Georgia',
        'HI' => 'Hawaii',
        'ID' => 'Idaho',
        'IL' => 'Illinois',
        'IN' => 'Indiana',
        'IA' => 'Iowa',
        'KS' => 'Kansas',
        'KY' => 'Kentucky',
        'LA' => 'Louisiana',
        'ME' => 'Maine',
        'MD' => 'Maryland',
        'MA' => 'Massachusetts',
        'MI' => 'Michigan',
        'MN' => 'Minnesota',
        'MS' => 'Mississippi',
        'MO' => 'Missouri',
        'MT' => 'Montana',
        'NE' => 'Nebraska',
        'NV' => 'Nevada',
        'NH' => 'New Hampshire',
        'NJ' => 'New Jersey',
        'NM' => 'New Mexico',
        'NY' => 'New York',
        'NC' => 'North Carolina',
        'ND' => 'North Dakota',
        'OH' => 'Ohio',
        'OK' => 'Oklahoma',
        'OR' => 'Oregon',
        'PA' => 'Pennsylvania',
        'RI' => 'Rhode Island',
        'SC' => 'South Carolina',
        'SD' => 'South Dakota',
        'TN' => 'Tennessee',
        'TX' => 'Texas',
        'UT' => 'Utah',
        'VT' => 'Vermont',
        'VA' => 'Virginia',
        'WA' => 'Washington',
        'WV' => 'West Virginia',
        'WI' => 'Wisconsin',
        'WY' => 'Wyoming',
        'DC' => 'District of Columbia',
        'PR' => 'Puerto Rico',
        'VI' => 'U.S. Virgin Islands',
        'GU' => 'Guam',
        'AS' => 'American Samoa',
        'MP' => 'Northern Mariana Islands',
    ];

    public function run(): void
    {
        if (! Schema::hasTable('us_city_postal_codes')) {
            $this->command?->warn('Skipping UsCityPostalCodeSeeder because table us_city_postal_codes does not exist.');
            return;
        }

        $rows = $this->loadDatasetRows();

        if (! is_array($rows)) {
            $this->command?->error('Invalid US city/state/postal dataset payload.');
            return;
        }

        UsCityPostalCode::query()->truncate();

        $payload = [];
        $batchSize = 2000;
        $inserted = 0;

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $city = trim((string) ($row['city'] ?? ''));
            $stateCode = strtoupper(trim((string) ($row['state'] ?? '')));
            $zipRaw = (string) ($row['zip_code'] ?? '');
            $postalCode = str_pad(preg_replace('/\D+/', '', $zipRaw), 5, '0', STR_PAD_LEFT);

            if ($city === '' || $stateCode === '' || strlen($postalCode) !== 5) {
                continue;
            }

            $stateName = self::STATE_NAME_BY_CODE[$stateCode] ?? $stateCode;

            $payload[] = [
                'city' => $city,
                'state_code' => $stateCode,
                'state_name' => $stateName,
                'postal_code' => $postalCode,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($payload) >= $batchSize) {
                $inserted += $this->upsertBatch($payload);
                $payload = [];
            }
        }

        if ($payload !== []) {
            $inserted += $this->upsertBatch($payload);
        }

        $this->command?->info("US city/state/postal seeding complete. Imported {$inserted} records.");
    }

    private function upsertBatch(array $payload): int
    {
        UsCityPostalCode::query()->upsert(
            $payload,
            ['state_code', 'city', 'postal_code'],
            ['state_name', 'updated_at'],
        );

        return count($payload);
    }

    private function loadDatasetRows(): ?array
    {
        $localPath = base_path(self::LOCAL_DATASET_PATH);

        if (File::exists($localPath)) {
            $decoded = json_decode((string) File::get($localPath), true);
            return is_array($decoded) ? $decoded : null;
        }

        $response = Http::timeout(90)
            ->retry(2, 500)
            ->acceptJson()
            ->withoutVerifying()
            ->get(self::DATASET_URL);

        if (! $response->ok()) {
            $this->command?->error('Unable to download US city/state/postal dataset.');
            return null;
        }

        $rows = $response->json();
        if (! is_array($rows)) {
            return null;
        }

        File::ensureDirectoryExists(dirname($localPath));
        File::put($localPath, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return $rows;
    }
}
