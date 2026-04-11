<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\MockAuthController;
use App\Http\Controllers\Api\StudentDashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\BankAccountController;

use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\FeeScheduleController;
use Illuminate\Support\Facades\Artisan;

Route::post('/login', [MockAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [MockAuthController::class, 'logout']);
    
    // Student Routes
    Route::get('/student/dashboard', [StudentDashboardController::class, 'index']);
    Route::post('/student/bank-account', [BankAccountController::class, 'store']);
    Route::get('/student/bank-account', [BankAccountController::class, 'index']);
    Route::post('/student/payments/{id}/submit-slip', [PaymentController::class, 'submitSlip']);

    // Admin Routes
    Route::middleware('can:admin-access')->group(function () {
        Route::get('/admin/payments', [AdminPaymentController::class, 'index']);
        Route::post('/admin/payments/{id}/verify', [AdminPaymentController::class, 'verify']);
        
        Route::get('/admin/fee-schedules', [FeeScheduleController::class, 'index']);
        Route::post('/admin/fee-schedules', [FeeScheduleController::class, 'store']);

        Route::post('/admin/sync-students', function() {
            Artisan::call('spms:sync-students');
            return response()->json(['message' => 'Students synced successfully']);
        });
    });
});
