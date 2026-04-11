<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $fillable = [
        'student_id',
        'bank_name',
        'account_holder_name',
        'account_number_encrypted',
        'branch',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
