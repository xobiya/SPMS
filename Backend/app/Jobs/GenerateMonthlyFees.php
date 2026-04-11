<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use App\Models\Student;
use App\Models\Payment;
use App\Models\FeeSchedule;
use Carbon\Carbon;

class GenerateMonthlyFees implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $now = Carbon::now();
        $month = $now->format('F');
        $year = $now->year;
        $academicYear = $year . '/' . ($year + 1); // Simplistic academic year calc

        // Find active fee schedule
        $schedule = FeeSchedule::where('effective_from', '<=', $now)
            ->where('effective_to', '>=', $now)
            ->first();

        if (!$schedule) {
            // Log or alert that no fee schedule exists
            return;
        }

        $nonCafeStudents = Student::where('cafe_status', 'NON_CAFE')
            ->where('is_active', true)
            ->get();

        foreach ($nonCafeStudents as $student) {
            // Idempotency check: don't create duplicate for same month/year
            $exists = Payment::where('student_id', $student->id)
                ->where('month', $month)
                ->where('academic_year', $academicYear)
                ->exists();

            if (!$exists) {
                Payment::create([
                    'student_id' => $student->id,
                    'amount_due' => $schedule->monthly_amount,
                    'due_date' => $now->copy()->day(15), // Due on 15th
                    'status' => 'PENDING',
                    'month' => $month,
                    'academic_year' => $academicYear,
                ]);
            }
        }
    }
}
