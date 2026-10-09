<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        // Jika Role = Owner, langsung beri akses TRUE ke semua method (view, create, delete, dll)
        if ($user->hasRole('owner')) {
            return true;
        }

        return null; // Lanjut ke pengecekan method spesifik (view, update, dll)
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['owner', 'branch_manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Branch $branch): bool
    {
        return $user->branch_id === $branch->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Branch $branch): bool
    {
        return $user->branch_id === $branch->id;
    }

    public function delete(){
        return false;
    }
}
