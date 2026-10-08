<?php

namespace App\Policies;

use App\Models\StockConsumption;
use App\Models\User;

class StockConsumptionPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('owner') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']);
    }

    public function view(User $user, StockConsumption $consumption): bool
    {
        return $user->branch_id === $consumption->branch_id;
    }
}