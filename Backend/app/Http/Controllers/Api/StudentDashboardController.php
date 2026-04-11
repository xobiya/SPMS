<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Student;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role !== 'STUDENT') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        $payments = Payment::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $bankAccount = $student->bankAccount;

        return response()->json([
            'student' => $student,
            'payments' => $payments,
            'bank_account' => $bankAccount ? [
                'bank_name' => $bankAccount->bank_name,
                'account_holder_name' => $bankAccount->account_holder_name,
                'account_number_masked' => '****' . substr(decrypt($bankAccount->account_number_encrypted), -4),
            ] : null,
        ]);
    }
}
