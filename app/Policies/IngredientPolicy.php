<?php

namespace App\Policies;

use App\Models\Ingredient;
use App\Models\User;

class IngredientPolicy
{
    /**
     * Buka semua akses jika role adalah Owner
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('owner')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        // Semua role yang memiliki cabang berhak melihat daftar bahan baku
        return $user->branch_id !== null;
    }

    public function view(User $user, Ingredient $ingredient): bool
    {
        // User hanya bisa lihat bahan baku milik cabangnya
        return $user->branch_id === $ingredient->branch_id;
    }

    public function create(User $user): bool
    {
        // Hanya Branch Manager & Head Chef yang boleh menambah master bahan
        return $user->hasAnyRole(['branch_manager', 'head_chef']);
    }

    public function update(User $user, Ingredient $ingredient): bool
    {
        return $user->hasAnyRole(['branch_manager', 'head_chef']) 
            && $user->branch_id === $ingredient->branch_id;
    }

    public function delete(User $user, Ingredient $ingredient): bool
    {
        // Hanya Branch Manager yang boleh menghapus master bahan di cabangnya
        return $user->hasRole('branch_manager') 
            && $user->branch_id === $ingredient->branch_id;
    }
}