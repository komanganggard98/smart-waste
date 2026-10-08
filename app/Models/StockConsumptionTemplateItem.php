<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockConsumptionTemplateItem extends Model
{
    protected $fillable = [
        'stock_consumption_template_id',
        'ingredient_id',
        'default_quantity',
    ];

    protected $casts = [
        'default_quantity' => 'decimal:6',
    ];

    public function template()
    {
        return $this->belongsTo(StockConsumptionTemplate::class, 'stock_consumption_template_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
