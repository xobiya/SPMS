<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\FeeSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin/Finance User
        User::updateOrCreate(
            ['email' => 'finance@amu.edu.et'],
            [
                'name' => 'Finance Admin',
                'role' => 'ADMIN',
                'password' => Hash::make('password'),
            ]
        );

        // Initial Fee Schedule
        FeeSchedule::updateOrCreate(
            ['academic_year' => '2025/2026', 'semester' => 1],
            [
                'monthly_amount' => 500.00,
                'effective_from' => Carbon::now()->startOfYear(),
                'effective_to' => Carbon::now()->endOfYear(),
            ]
        );
    }
}