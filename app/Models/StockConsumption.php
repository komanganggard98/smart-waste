<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockConsumption extends Model
{
    protected $fillable = [
        'branch_id',
        'ingredient_batch_id',
        'user_id',
        'consumption_date',
        'quantity',
        'purpose',
        'notes',
    ];

    protected $casts = [
        'consumption_date' => 'datetime',
        'quantity' => 'decimal:6',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function ingredientBatch()
    {
        return $this->belongsTo(IngredientBatch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
