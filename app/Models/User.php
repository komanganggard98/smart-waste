<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

// use App\Traits\HasCustomUuid;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 
        'email', 
        'password',
        'branch_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getPermissions(){
        $classAbilities =  ['viewAny','view','create','update','delete'];
        $models = [
            'User' => User::class,
            'Branch' => Branch::class,
            'Ingredient' => Ingredient::class,
            'IngredientBatch' => IngredientBatch::class,
            'StockConsumption' => StockConsumption::class,
            'StockConsumptionTemplate' => StockConsumptionTemplate::class,
            'WasteLog' => WasteLog::class,
        ];
        $permissions = [];
        foreach($models as $key => $model){
            foreach($classAbilities as $ability){
                $permissions["{$ability}{$key}"] =  $this->can($ability, $model) ;
            }
        }

        return $permissions;
    }

    public function branch(){
        return $this->belongsTo(Branch::class);
    }
}
