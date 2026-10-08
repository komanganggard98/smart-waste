<?php

namespace App\Repositories;

use App\Models\IngredientBatch;
use Illuminate\Support\Facades\DB;

class IngredientBatchRepository extends BaseRepository
{
    public function getData($user, $request){
        $branchId = $user->branch_id;
        if($user->hasRole('owner')){
            $branchId = $request->branch_id;
        }
        return IngredientBatch::query()
        ->when($request->filled('name'), fn($q) => $q->where('name','like',"%$request->name%"))
        ->whereHas('ingredient', function ($query) use ($branchId) {
            if ($branchId) {
                $query->where('branch_id', $branchId);
            }
        })
        ->latest()
        ->when($request->boolean('is_paginate'), fn($q) => $q->paginate(10), fn($q) => $q->get() );
    }

    public function availableBatches($user, $request){
        $branchId = $user->branch_id;
        if($user->hasRole('owner')){
            $branchId = $request->branch_id;
        }
        return IngredientBatch::query()
            ->with(['ingredient' => function($q){
                return 
                $q
                ->select('id','branch_id','name','unit')
                ->with('branch:id,name,address');         
            }])
            ->where('quantity_remaining', '>', 0)
            ->whereHas('ingredient', function ($query) use ($branchId) {
                if ($branchId) {
                    $query->where('branch_id', $branchId);
                }
            })
            ->orderBy('expiration_date', 'asc') // Urutkan berdasarkan FIFO
            ->get();
    }

    public function restoreBatchStock(IngredientBatch $batch, float $quantity)
    {
        $batch->increment('quantity_remaining', $quantity);
        return $batch->refresh();     
    }

    public function decrementBatchStock(IngredientBatch $batch, float $quantity)
    {
        $batch->decrement('quantity_remaining', $quantity);   
        return $batch->refresh();     
    }

    public function totalStockReceivedCost($branchId, $startDate, $endDate){
        return IngredientBatch::query()
                ->whereHas('ingredient', fn($q) => $q->where('branch_id', $branchId))
                ->whereBetween('purchase_date', [$startDate, $endDate])
                ->sum(DB::raw('quantity_received * unit_cost'));
    }

    public function currentStockValue($branchId){
        return IngredientBatch::query()
                       ->whereHas('ingredient', fn($q) => $q->where('branch_id', $branchId))
                       ->where('quantity_remaining', '>', 0)
                       ->sum(DB::raw('quantity_remaining * unit_cost'));
    }

    public function nearExpiry($branchId, $countOnly = false){
        return IngredientBatch::query()
                    ->with(['ingredient.branch'])
                    ->where('quantity_remaining', '>', 0)
                    ->whereBetween('expiration_date', [now(), now()->addDays(7)])
                    ->when($branchId, function($q) use($branchId) {
                        $q->whereHas('ingredient', fn($i) => $i->where('branch_id', $branchId));
                    })
                    ->orderBy('expiration_date', 'asc')
                    ->when($countOnly == true,
                        fn($q) => $q->count(),
                        fn($q) => $q->get(),
                    );
    } 


}