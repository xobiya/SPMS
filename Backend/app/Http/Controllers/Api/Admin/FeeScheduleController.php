<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\FeeSchedule;
use Illuminate\Support\Facades\Validator;

class FeeScheduleController extends Controller
{
    public function index()
    {
        return response()->json(FeeSchedule::orderBy('effective_from', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'academic_year' => 'required|string',
            'semester' => 'required|integer',
            'monthly_amount' => 'required|numeric',
            'effective_from' => 'required|date',
            'effective_to' => 'required|date|after:effective_from',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = FeeSchedule::create($request->all());

        return response()->json(['message' => 'Fee schedule created successfully', 'schedule' => $schedule]);
    }
}
