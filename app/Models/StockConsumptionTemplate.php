<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class StockConsumptionTemplate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id',
        'name',
        'purpose',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function items()
    {
        return $this->hasMany(StockConsumptionTemplateItem::class, 'stock_consumption_template_id');
    }
}