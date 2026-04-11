<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeSchedule extends Model
{
    protected $fillable = [
        'academic_year',
        'semester',
        'monthly_amount',
        'effective_from',
        'effective_to',
    ];
}
