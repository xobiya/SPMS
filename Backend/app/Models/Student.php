<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'smis_id',
        'full_name',
        'email',
        'phone',
        'department',
        'year_of_study',
        'cafe_status',
        'classification_date',
        'is_active',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function bankAccount()
    {
        return $this->hasOne(BankAccount::class);
    }
}
