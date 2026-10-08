<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WasteLog;
use Illuminate\Auth\Access\Response;

class WasteLogPolicy
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
        return $user->hasAnyRole(['owner', 'branch_manager', 'head_chef', 'kitchen_staff']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WasteLog $wasteLog): bool
    {
        return $user->hasAnyRole(['owner', 'branch_manager', 'head_chef', 'kitchen_staff']);        
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['owner', 'branch_manager', 'head_chef', 'kitchen_staff']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WasteLog $wasteLog): bool
    {
        // Owner selalu bisa
        if ($user->hasRole('owner')) {
            return true;
        }

        // Branch Manager hanya bisa edit jika di cabangnya DAN kurang dari 24 jam
        if ($user->hasRole('branch_manager')) {
            return $user->branch_id === $wasteLog->branch_id 
                && $wasteLog->created_at->diffInHours(now()) <= 24;
        }

        // Staf Dapur & Head Chef DILARANG EDIT setelah disimpan!
        return false;
    }
}
