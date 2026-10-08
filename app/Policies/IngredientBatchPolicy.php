<?php
namespace App\Policies;

use App\Models\IngredientBatch;
use App\Models\User;

class IngredientBatchPolicy
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
        return $user->branch_id !== null;
    }

    public function view(User $user, IngredientBatch $ingredientBatch): bool
    {
        // Cek apakah batch terhubung ke ingredient milik cabang user
        return $user->branch_id === $ingredientBatch->ingredient->branch_id;
    }

    public function create(User $user): bool
    {
        // Manager, Head Chef, dan Kitchen Staff boleh mencatat penerimaan stok baru
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff']);
    }

    public function update(User $user, IngredientBatch $ingredientBatch): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef', 'kitchen_staff'])
            && $user->branch_id === $ingredientBatch->ingredient->branch_id;
    }

    public function delete(User $user, IngredientBatch $ingredientBatch): bool
    {
        // Koreksi/Hapus batch hanya boleh dilakukan oleh Manager / Head Chef
        return $user->hasAnyRole(['branch_manager', 'head_chef'])
            && $user->branch_id === $ingredientBatch->ingredient->branch_id;
    }
}