<?php 

namespace App\Services;
use App\Repositories\{IngredientRepository, BaseRepository};
use App\Models\{Ingredient, IngredientBatch, Branch};
use App\Traits\NormalizesData;
use Illuminate\Support\Facades\DB;

class IngredientService{
    use NormalizesData;

    public function __construct(
        protected IngredientRepository $ingredientRepo,
        protected BaseRepository $baseRepo,
        protected Ingredient $model,
    ){
    }

    public function index($request){
        if (!$request->user()->hasRole('owner')) {
            $request->merge(['branch_id' => $request->user()->branch_id]);
        }

        if ($request->filled('search')) {
            $request->merge(['name' => $request->input('search')]);
        }

        $request->merge(['is_paginate' => true]);

        $ingredients = $this->getData($request);
        $branches = $request->user()->hasRole('owner')
            ? Branch::query()->orderBy('name','asc')->get(['id', 'name'])
            : collect();

        return [
            'data' => $ingredients,
            'filters' => (object)$request->only(['filter', 'branch_id', 'search']),
            'branches' => $branches,
        ];
    }

    public function getData($request){
        return $this->normalizeData($this->ingredientRepo->getData($request));
    }

    public function findData($id){
        return $this->normalizeData($this->ingredientRepo->findData($this->model, $id));
    }

    public function codeExists(string $code, int $branchId, $exceptIngredientId): bool
    {
        return $this->ingredientRepo->codeExists($code, $branchId, $exceptIngredientId);
    }

    public function storeData($data){
        DB::beginTransaction();
        try{
            $ingredient = $this->baseRepo->store($this->model, $data);
            if(isset($data['with_batch']) && $data['with_batch'] && isset($data['batch'])) {
                $batchData = $data['batch'];
                $batchData['ingredient_id'] = $ingredient->id;
                $this->baseRepo->store(IngredientBatch::class, $batchData);
            }
            DB::commit();
            return $ingredient;
        }catch(\Exception $e){
            DB::rollBack();
            throw $e;
        }
    }
}
