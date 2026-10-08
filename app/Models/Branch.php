<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{
    Model,
    SoftDeletes,
};

use App\Traits\{HasCustomUuid, CustomCascadeSoftDeletes};

class Branch extends Model
{
    use SoftDeletes, CustomCascadeSoftDeletes, HasCustomUuid;

    protected $fillable = [
        'name',
        'address',
        'is_active'
    ];

    public function ingredients(){
        return $this->hasMany(Ingredient::class);
    }

    public function wasteLogs(){
        return $this->hasMany(WasteLog::class);
    }

    public function users(){
        return $this->hasMany(User::class);
    }

    public function notifications(){
        return $this->hasMany(User::class);
    }
}
