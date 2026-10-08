<?php

namespace App\Repositories;
use App\Models\{StockConsumptionTemplate};

class StockConsumptionTemplateRepository extends BaseRepository
{    
    public function getData($user, $request){
        return StockConsumptionTemplate::query()
            ->with([
                'branch:id,name',
                'items.ingredient:id,name,unit',
            ])
            // Filter berdasarkan cabang jika bukan Owner
            ->when(! $user->hasRole('owner'), function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            ->when($request->boolean('is_paginate'), fn($q) => $q->paginate(10), fn($q) => $q->get() );
    }

    public function storeTemplate($request) {
        return StockConsumptionTemplate::create($request);
    }
}