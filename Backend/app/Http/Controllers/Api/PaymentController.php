<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function submitSlip(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|unique:payments,reference_number,' . $id,
            'slip' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB limit
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::findOrFail($id);
        $student = Auth::user()->student;

        if ($payment->student_id !== $student->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($payment->status !== 'PENDING' && $payment->status !== 'REJECTED') {
            return response()->json(['error' => 'Payment already submitted or verified'], 400);
        }

        if ($request->hasFile('slip')) {
            $path = $request->file('slip')->store('slips', 'public');
            $payment->slip_file_path = $path;
        }

        $payment->reference_number = $request->reference_number;
        $payment->payment_method = $request->payment_method;
        $payment->status = 'UNDER_REVIEW';
        $payment->save();

        return response()->json(['message' => 'Payment slip submitted successfully', 'payment' => $payment]);
    }
}
