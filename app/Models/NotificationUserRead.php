<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationUserRead extends Model
{
    protected $fillable = [
        'user_id',
        'batch_token',
    ];
}
