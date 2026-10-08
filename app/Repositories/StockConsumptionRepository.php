<?php

namespace App\Repositories;
use App\Models\ {StockConsumption};

class StockConsumptionRepository extends BaseRepository
{    
    public function getData($user, $request){
        return StockConsumption::query()
            ->with([
                'branch:id,name',
                'ingredientBatch.ingredient:id,name,unit',
                'user:id,name',
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

}