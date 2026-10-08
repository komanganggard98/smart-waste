<?php

namespace App\Repositories;

use App\Models\Branch;

class BranchRepository extends BaseRepository
{
    public function getData($request, $select = ['*'])
    {
        $filters = is_array($request) ? $request : [];

        return Branch::query()
            ->select($select)
            ->when(isset($filters['id']), function($q) use($filters){
                return $q->where('id', $filters['id']);
            })
            ->when(isset($filters['name']), function($q) use($filters){
                $name = $filters['name'];
                return $q->where('name', 'like', "%$name%");
            })
            ->when(isset($filters['is_active']), function ($q) use($filters){
                return $q->where('is_active', $filters['is_active']);
            })
            ->when(!blank($filters['is_archive'] ?? null), fn($q) => $q->onlyTrashed())
            ->when(!blank($filters['with_total_ingredients'] ?? null), fn ($q) => $q->withCount('ingredients'))
            // ->orderBy(($filters['order_by'] ?? 'id'),  ($filters['order_type'] ?? 'desc'))
            ->when(!blank($filters['is_paginate'] ?? null), fn ($q) => $q->paginate(5), fn ($q) => $q->get());
    }
}
