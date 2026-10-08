<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'branch_id',
        'ingredient_id',
        'category',
        'batch_token',
        'message',
    ];

    public function branch(){
        return $this->belongsTo(Branch::class);
    }

    public function ingredient(){
        return $this->belongsTo(Ingredient::class);
    }
}
