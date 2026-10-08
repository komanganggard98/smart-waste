<?php

namespace App\Repositories;
use App\Models\WasteLog;
use Carbon\Carbon;

class WasteLogRepository extends BaseRepository
{    
    public function getData($user, $request){
        return WasteLog::query()
            ->with([
                'branch:id,name',
                'ingredientBatch.ingredient:id,name,unit',
            ])
            // Filter berdasarkan cabang jika bukan Owner
            ->when(! $user->hasRole('owner'), function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            // Filter opsional berdasarkan tanggal jika ada di query string
            ->when($request->filled('start_date'), function ($query) use ($request) {
                $query->whereDate('waste_date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('waste_date', '<=', $request->end_date);
            })
            ->when($request->boolean('is_paginate'), fn($q) => $q->paginate(10), fn($q) => $q->get() );
    }

    public function totalWasteCost($startDate, $endDate, $branchId = null): float
    {
        return (float) WasteLog::query()
            ->when($branchId != null, fn($q, $branchId) => $q->where('branch_id', $branchId))
            ->whereBetween('waste_date', [$startDate, $endDate])
            ->sum('cost_loss');
    }

}