<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AdminPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('student');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('updated_at', 'desc')->paginate(20));
    }

    public function verify(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:VERIFIED,REJECTED',
            'reason' => 'nullable|string',
        ]);

        $payment = Payment::findOrFail($id);
        $oldValue = $payment->toArray();

        $payment->status = $request->status;
        if ($request->status === 'VERIFIED') {
            $payment->amount_paid = $payment->amount_due;
            $payment->payment_date = now();
        }
        $payment->save();

        // Audit Log
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'PAYMENT_' . $request->status,
            'entity_type' => 'Payment',
            'entity_id' => $payment->id,
            'old_value' => $oldValue,
            'new_value' => $payment->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Payment status updated successfully', 'payment' => $payment]);
    }
}
