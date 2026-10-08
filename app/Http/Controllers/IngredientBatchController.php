<?php

namespace App\Http\Controllers;

use App\Http\Requests\IngredientBatch\{StoreIngredientBatchRequest, UpdateIngredientBatchRequest};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{IngredientBatch};
use App\Repositories\{IngredientBatchRepository, IngredientRepository};
use App\Services\{GeneralService, IngredientBatchService};
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; 

class IngredientBatchController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected GeneralService $generalService, 
        protected IngredientBatchService $ingredientBatchService,
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected IngredientBatch $model,
        protected IngredientRepository $ingredientRepo
    ){
        $this->authorizeResource(IngredientBatch::class, 'ingredient_batch');    
    }

    public function create(Request $request){
        $user = $request->user();
        $branchId = $user->hasRole('owner') ? null : $user->branch_id; 
        $ingredients = $this->ingredientRepo->getIngredients(
            $branchId,
            [
                ['order_by' => 'name'],
                ['order_type' => 'asc'],
            ]
        );

        return Inertia::render('IngredientBatch/Create', [
            'ingredients' => $ingredients,
            'default_ingredient_id' => $request->integer('ingredient_id') ?: null,
        ]);
    }

    public function available(Request $request){
        return response()->json([
            'data' => $this->ingredientBatchService->availableBatches($request->user(), $request),
        ]);
    }

    public function show(IngredientBatch $ingredientBatch){
        try{
            $ingredientBatch = $this->ingredientBatchService->findData($ingredientBatch->id);
            return Inertia::render('IngredientBatch/Show',[
                'data' => $ingredientBatch,
            ]);
        }catch(Exception $e){
            return redirect()->route('dashboard')->with('error', $this->generalService->setErrorMessage($e));
        }
    }

    public function store(StoreIngredientBatchRequest $request){
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();

        try{
            $batch = $this->ingredientBatchRepo->store($this->model, $data);
            $batch->load('ingredient:id,branch_id,name,unit');
        }catch(Exception $e){
            if ($wantsJson && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_ingredient_batch_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_ingredient_batch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($wantsJson && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Data successfully created',
                'data' => $batch,
            ], 201);
        }

        return redirect()->route('ingredient-batches.index')->with('success',' Data successfully created');
    }

    public function update(UpdateIngredientBatchRequest $request, IngredientBatch $ingredientBatch){
        $data = $request->validated();

        try{
            $ingredientBatch->update($data);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'update_ingredient_batch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('ingredient-batches.index')->with('success',' Data successfully updated');
    }

    public function destroy(IngredientBatch $ingredientBatch){
        try{
            $ingredientBatch->delete();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'delete_ingredient_batch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('ingredient-batches.index')->with('success',' Data successfully deleted');
    }

    public function forceDelete(IngredientBatch $ingredientBatch){
        try{
            $ingredientBatch->forceDelete();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'force_delete_ingredient_batch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully deleted');
    }

    public function restore(IngredientBatch $ingredientBatch){
        try{
            $ingredientBatch->restore();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'restore_ingredient_batch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully restored');
    }
}
