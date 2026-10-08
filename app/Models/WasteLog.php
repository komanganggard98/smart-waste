<?php

namespace App\Models;

use App\Traits\HasCustomUuid;
use Illuminate\Database\Eloquent\Model;

class WasteLog extends Model
{    
    use HasCustomUuid;
    
    protected $fillable = [
        'branch_id',
        'ingredient_batch_id',
        'user_id',
        'waste_date',
        'quantity',
        'reason',
        'cost_loss',
        'notes'
    ];

    protected $casts = [
        'waste_date' => 'datetime',
        'quantity' => 'decimal:6',
        'cost_loss' => 'decimal:2',
    ];

    public function branch(){
        return $this->belongsTo(Branch::class);
    }

    public function ingredientBatch(){
        return $this->belongsTo(IngredientBatch::class);
    }
}
