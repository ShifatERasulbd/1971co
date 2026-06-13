<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LoginTestSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a deterministic test account for login verification.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'login-test@example.com'],
            [
                'name' => 'Login Test User',
                'password' => 'Password123!',
            ]
        );
    }
}
