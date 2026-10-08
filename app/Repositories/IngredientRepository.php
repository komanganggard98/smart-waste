<?php

namespace App\Repositories;
use App\Models\{Ingredient, IngredientBatch};
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class IngredientRepository extends BaseRepository
{
    public function codeExists(string $code, int $branchId, $exceptIngredientId = null): bool
    {
        return Ingredient::withTrashed()
            ->when($exceptIngredientId, fn($q) => $q->where('id', '!=', $exceptIngredientId))
            ->where('branch_id', $branchId)
            ->where('code', $code)
            ->exists();
    }

    public function getData($request, $select = ['*']){
        $filters = is_array($request) ? $request : $request->all();
        $nearExpiryBatchFilter = function ($batchQuery) {
            $batchQuery
                ->where('quantity_remaining', '>', 0)
                ->whereRaw('ingredient_batches.expiration_date <= DATE_ADD(CURDATE(), INTERVAL ingredients.expiry_alert_days DAY)');
        };

        return $this->ingredientsQuery($filters['branch_id'] ?? null, $filters)
        ->when(!blank($filters['has_no_batch'] ?? null), function($q){
            $q->whereDoesntHave('ingredientBatches');
        })
        ->select($select)
        ->withCount('ingredientBatches')
        ->withSum(['ingredientBatches as total_remaining' => function ($query) {
            $query->where('quantity_remaining', '>', 0);
        }], 'quantity_remaining')
        ->withMin(['ingredientBatches as nearest_expiration_date' => function ($query) {
            $query->where('quantity_remaining', '>', 0);
        }], 'expiration_date')
        ->when(($filters['filter'] ?? null) === 'low_stock', function ($q) {
            $q->havingRaw('COALESCE(total_remaining, 0) < ingredients.minimum_stock');
        })
        ->when(($filters['filter'] ?? null) === 'near_expiry', function ($q) use ($nearExpiryBatchFilter) {
            $q->whereHas('ingredientBatches', $nearExpiryBatchFilter);
        })
        ->when(($filters['filter'] ?? null) === 'near_expiry', function ($q) use ($nearExpiryBatchFilter) {
            $q->with(['ingredientBatches' => function ($batchQuery) use ($nearExpiryBatchFilter) {
                $batchQuery
                    ->join('ingredients', 'ingredients.id', '=', 'ingredient_batches.ingredient_id')
                    ->select('ingredient_batches.*');
                $nearExpiryBatchFilter($batchQuery);
            }]);
        })
        ->orderBy($filters['order_by'] ?? 'created_at', $filters['order_type'] ?? 'desc')
        ->when(!blank($filters['is_paginate'] ?? null), fn ($q) => $q->paginate(5), fn ($q) => $q->get());
    }

    public function countIngredients($branchId, $request = null): int
    {
        return $this->ingredientsQuery($branchId, $request)->count();
    }

    public function getIngredients($branchId, $request = null, ?int $limit = null): Collection
    {
        return $this->ingredientsQuery($branchId, $request)
            ->orderBy($request['order_by'] ?? 'created_at', $request['order_type'] ?? 'desc')
            ->when($limit, fn ($query) => $query->limit($limit))
            ->get();
    }

    public function totalIngredients($branchId, $request = null, int $previewLimit = 3): array
    {
        return [
            'total' => $this->countIngredients($branchId, $request),
            'ingredients' => $this->getIngredients($branchId, $request, $previewLimit)
        ];
    }

    private function ingredientsQuery($branchId, $request = null): Builder
    {
        $filters = is_array($request) ? $request : ($request?->all() ?? []);

        return Ingredient::query()
        ->when($branchId != null, fn($q) => $q->where('branch_id', $branchId))
        ->when(!blank($filters['name'] ?? null), fn($q) => $q->where(function ($query) use ($filters) {
            $query->where('name', 'like', '%' . $filters['name'] . '%')
                ->orWhere('code', 'like', '%' . $filters['name'] . '%');
        }))
        ->with('branch');
    }
    

    // ---------- LOW STOCK ----------------- //
    public function countLowStock($branchId): int
    {
        return $this->lowStockQuery($branchId)->count();
    }

    public function getLowStock($branchId, array $columns = ['*'], ?int $limit = null, $request = []): Collection
    {
        $filters = is_array($request) ? $request : ($request?->all() ?? []);

        return $this->lowStockQuery($branchId, $columns)
            ->with(['branch', 'ingredientBatches' => fn($q) => $q->where('quantity_remaining', '>', 0)]) 
            ->orderByDesc('created_at')
            ->when($limit !== null, fn ($query) => $query->limit($limit))
            ->when(!blank($filters['is_paginate'] ?? null), fn($q) => $q->paginate(10), fn($q) => $q->get());
    }

    public function lowStock($branchId, int $previewLimit = 3): array
    {
        return [
            'total' => $this->countLowStock($branchId),
            'ingredients' => $this->getLowStock($branchId, ['*'], $previewLimit)
        ];
    }

    private function lowStockQuery($branchId, array $columns = ['*']): Builder
    {
        return Ingredient::query()
                ->select($columns)
                ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
                ->withSum(['ingredientBatches as total_remaining' => function ($query) {
                    $query->where('quantity_remaining', '>', 0);
                }], 'quantity_remaining')
                ->havingRaw('COALESCE(total_remaining, 0) < ingredients.minimum_stock');
    }


    // ---------- EXPIRING INGREDIENT ----------------- //
    public function countExpiringIngredients($branchId, $columns = ['*']){
        return $this->expiringIngredientsQuery($branchId, $columns)->count();
    }

    public function getExpiringIngredients($branchId, $columns = ['*'], $limit = 3){
        return $this->expiringIngredientsQuery($branchId, $columns)
        ->orderByDesc('created_at')
        ->when($limit !== null, fn ($query) => $query->limit($limit))
        ->get();
    }

    public function expiringIngredients($branchId, int $previewLimit = 3): array{
        return [
            'total' => $this->countExpiringIngredients($branchId),
            'ingredients' => $this->getExpiringIngredients($branchId, ['*'], $previewLimit)
        ];
    }

    public function expiringIngredientsQuery($branchId, $columns = ['*']): Builder {
        return Ingredient::query()
            ->select($columns)
            ->with(['branch', 'ingredientBatches'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereHas('ingredientBatches', function($q){
                // filter berdasarkan tanggal kadaluarsa yang mendekati expiry_alert_days
                $q
                ->whereRaw('expiration_date <= DATE_ADD(CURDATE(), INTERVAL ingredients.expiry_alert_days DAY)')
                ->where('quantity_remaining','>',0);
            });
    }

    public function totalRemaining(Ingredient $ingredient){
        return $ingredient->ingredientBatches()->sum('quantity_remaining');
    }

    public function getAllMovements($branchId = null, $limit = 5){
        $incomings = DB::table('ingredient_batches')
        ->join('ingredients','ingredient_batches.ingredient_id','ingredients.id')
        ->when($branchId, fn($q) => $q->where('ingredients.branch_id', $branchId))
        ->select(
            'ingredient_batches.id as reference_id',
            'ingredients.id as ingredient_id',
            'ingredients.name as ingredient_name',
            DB::raw("'incoming' as type"),
            'ingredient_batches.batch_number',
            'ingredient_batches.quantity_received as quantity',
            'ingredient_batches.purchase_date as date',
            DB::raw("'restock' as description"),
            'ingredients.unit'
        );

        $outgoing = DB::table('waste_logs')
        ->join('ingredient_batches','waste_logs.ingredient_batch_id','ingredient_batches.id')
        ->join('ingredients','ingredient_batches.ingredient_id','ingredients.id')
        ->when($branchId, fn($q) => $q->where('ingredients.branch_id', $branchId))
        ->select(
            'waste_logs.id as reference_id',
            'ingredients.id as ingredient_id',
            'ingredients.name as ingredient_name',
            DB::raw("'outgoing' as type"),
            'ingredient_batches.batch_number',
            'waste_logs.quantity as quantity',
            'waste_logs.waste_date as date',
            'waste_logs.reason as description',
            'ingredients.unit'
        );

        $movements = $incomings->unionAll($outgoing)
        ->orderBy('date','desc')
        ->limit($limit)
        ->get();

        return $movements;
    }
}