<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'student_id',
        'amount_due',
        'amount_paid',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'reference_number',
        'slip_file_path',
        'month',
        'academic_year',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
