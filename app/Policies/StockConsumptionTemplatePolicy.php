<?php

namespace App\Policies;

use App\Models\{StockConsumptionTemplate, User};

class StockConsumptionTemplatePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('owner')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']);
    }

    public function view(User $user, StockConsumptionTemplate $stock_consumption_template): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']) 
            && $user->branch_id === $stock_consumption_template->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']);
    }

    public function update(User $user, StockConsumptionTemplate $stock_consumption_template): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']) && $user->branch_id && $user->branch_id === $stock_consumption_template->branch_id;
    }


    public function delete(User $user, StockConsumptionTemplate $template): bool{
        return false;
    }
}