<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SyncStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'spms:sync-students';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync student data from SMIS and classify as CAFE/NON_CAFE';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting student synchronization from SMIS...');

        // Mock SMIS Data
        $mockStudents = [
            [
                'smis_id' => 'AMU/1001/14',
                'full_name' => 'Abebe Kebede',
                'email' => 'abebe.kebede@amu.edu.et',
                'phone' => '0911223344',
                'department' => 'Software Engineering',
                'year_of_study' => 3,
                'enrollment_package' => 'NON_CAFE_DORM'
            ],
            [
                'smis_id' => 'AMU/1002/14',
                'full_name' => 'Chaltu Mohammed',
                'email' => 'chaltu.m@amu.edu.et',
                'phone' => '0922334455',
                'department' => 'Civil Engineering',
                'year_of_study' => 2,
                'enrollment_package' => 'CAFE_DORM'
            ],
            [
                'smis_id' => 'AMU/1003/14',
                'full_name' => 'Samuel Tekle',
                'email' => 'samuel.t@amu.edu.et',
                'phone' => '0933445566',
                'department' => 'Computer Science',
                'year_of_study' => 4,
                'enrollment_package' => 'NON_CAFE_PRIVATE'
            ],
        ];

        $syncCount = 0;
        foreach ($mockStudents as $data) {
            // Determine Cafe Status
            $cafeStatus = Str::contains($data['enrollment_package'], 'CAFE') && !Str::contains($data['enrollment_package'], 'NON_CAFE') 
                ? 'CAFE' 
                : 'NON_CAFE';

            // Create or Update Student
            $student = Student::updateOrCreate(
                ['smis_id' => $data['smis_id']],
                [
                    'full_name' => $data['full_name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'department' => $data['department'],
                    'year_of_study' => $data['year_of_study'],
                    'cafe_status' => $cafeStatus,
                    'classification_date' => now(),
                ]
            );

            // Create or Update User for Student
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'smis_id' => $data['smis_id'],
                    'name' => $data['full_name'],
                    'role' => 'STUDENT',
                    'password' => Hash::make('password'), // Default password
                ]
            );

            $syncCount++;
        }

        $this->info("Successfully synced {$syncCount} students.");
    }
}
