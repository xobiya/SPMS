<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BankAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|string',
            'account_holder_name' => 'required|string',
            'account_number' => 'required|string',
            'branch' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = Auth::user()->student;

        $bankAccount = BankAccount::updateOrCreate(
            ['student_id' => $student->id],
            [
                'bank_name' => $request->bank_name,
                'account_holder_name' => $request->account_holder_name,
                'account_number_encrypted' => encrypt($request->account_number),
                'branch' => $request->branch,
            ]
        );

        return response()->json(['message' => 'Bank account saved successfully', 'bank_account' => $bankAccount]);
    }

    public function index()
    {
        $student = Auth::user()->student;
        $bankAccount = $student->bankAccount;

        if (!$bankAccount) {
            return response()->json(['bank_account' => null]);
        }

        return response()->json([
            'bank_account' => [
                'bank_name' => $bankAccount->bank_name,
                'account_holder_name' => $bankAccount->account_holder_name,
                'account_number_masked' => '****' . substr(decrypt($bankAccount->account_number_encrypted), -4),
                'branch' => $bankAccount->branch,
            ]
        ]);
    }
}
