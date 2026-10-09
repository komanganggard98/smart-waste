<?php

namespace App\Repositories;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserRepository extends BaseRepository
{
    public function getData($request){
        return User::query()
        ->when($request->filled('name'), fn($q) => $q->where('name','like',"%$request->name%"))
        ->when($request->filled('branch_id'), fn($q) => $q->where('branch_id',$request->branch_id))
        ->when(!blank($request['with_branch'] ?? null), fn($q) => $q->with('branch'))
        ->when(!blank($request['with_role'] ?? null), fn($q) => $q->with('roles:id,name'))
        ->latest()
        ->when($request->boolean('is_paginate'), 
        fn($q) => $q->paginate(10)->through(function($user){
            $item = $user;
            $item->can = [
                'update' => Auth::user()->can('update', $user),
                'delete' => Auth::user()->can('delete', $user)
            ];
            return $item;
        }), 
        fn($q) => $q->get()->map(function($user){
            $item = $user;
            $item->can = [
                'update' => Auth::user()->can('update', $user),
                'delete' => Auth::user()->can('delete', $user)
            ];
            return $item;
        }) );
    }

    public function showData($id){
        return User::with(['branch'])->findOrFail($id);
    }

    public function assignRoles($user, $roleIds){
        return $user->syncRoles($roleIds);
    }

}