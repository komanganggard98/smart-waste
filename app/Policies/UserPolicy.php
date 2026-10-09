<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{

    public function before(User $user){
        if($user->hasRole('owner')){
            return true;
        }

        return null;
    }
    
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('branch_manager');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return ($user->hasRole('branch_manager') && $user->branch_id === $model->branch_id) || ($user->id === $model->id);
    }

    /**
     * WAJIB DITAMBAHKAN: Digunakan oleh authorizeResource() sebelum memproses method store().
     */
    public function create(User $user): bool
    {
        // Berikan true jika Anda ingin mengizinkan peran selain 'owner' membuat user baru.
        // Jika hanya 'owner' yang boleh membuat user, cukup return false (karena owner sudah dihandle di before()).
        return $user->hasRole('branch_manager');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Manager hanya bisa update bawahan di cabangnya (bukan sesama manager/owner) / akun miliknya
        return (
             $user->hasRole('branch_manager') && $user->branch_id === $model->branch_id && ! $model->hasAnyRole(['owner', 'branch_manager'])
        ) || $user->id === $model->id;
    }

    /**
     * WAJIB DITAMBAHKAN: Digunakan oleh authorizeResource() sebelum memproses method destroy().
     */
    public function delete(User $user, User $model): bool
    {
        // 1. Pastikan yang menghapus adalah branch_manager
        if (!$user->hasRole('branch_manager')) {
            return false;
        }

        // 2. Mencegah menghapus akun sendiri
        if ($user->id === $model->id) {
            return false;
        }

        // 3. Pastikan berada di cabang yang sama
        if ($user->branch_id !== $model->branch_id) {
            return false;
        }

        // 4. Batasi hanya bisa menghapus role tertentu saja
        return $model->hasAnyRole(['head_chef', 'kitchen_staff']);
    }
}
