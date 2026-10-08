<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ingredient\{GetIngredientsRequest, StoreIngredientRequest, UpdateIngredientRequest};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Ingredient;
use App\Repositories\{BaseRepository, IngredientRepository};
use App\Services\{GeneralService, IngredientService};
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; 

class IngredientController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected GeneralService $generalService, 
        protected IngredientService $ingredientService,
        protected BaseRepository $baseRepo,
        protected IngredientRepository $ingredientRepo
    ){
        $this->authorizeResource(Ingredient::class, 'ingredient');
    }

    public function index(Request $request){
        $data = $this->ingredientService->index($request);

        return Inertia::render('Ingredient/Index', $data);
    }

    public function show(Ingredient $ingredient){
        $ingredient = $ingredient->load([
            'ingredientBatches' => function ($query) {
            $query->orderByDesc('expiration_date');
        }, 'branch']);

        return Inertia::render('Ingredient/Show',[
            'data' => $ingredient,
        ]);
    }

    public function store(StoreIngredientRequest $request){
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();
        
        try{
            $ingredient = $this->ingredientService->storeData($data);
        }catch(Exception $e){
            // Cek apakah request mengharapkan JSON
            if ($wantsJson && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_ingredient_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_ingredient_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($wantsJson && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Data successfully created',
                'data' => $ingredient->load('ingredientBatches')
            ], 201);
        }

        return redirect()->back()->with('success',' Data successfully created');
    }

    public function update(UpdateIngredientRequest $request, Ingredient $ingredient){
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();
        
        try{
            $ingredient->update($data);
        }catch(Exception $e){
            if($wantsJson && !$request->header('X-Inertia')){
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'update_ingredient_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }
            throw ValidationException::withMessages([
                'update_ingredient_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if($wantsJson && !$request->header('X-Inertia')){
            return response()->json([
                'message' => 'Data successfully updated',
                'data' => $ingredient
            ], 200);
        }

        return redirect()->route('ingredients.index')->with('success',' Data successfully updated');
    }

    public function destroy(Ingredient $ingredient){
        try{
            $ingredient->delete($ingredient->id);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'delete_ingredient_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('ingredients.index')->with('success',' Data successfully deleted');
    }

    public function forceDelete(Ingredient $ingredient){
        try{
            $ingredient->forceDelete();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'force_delete_ingredient_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully deleted');
    }

    public function restore(Ingredient $ingredient){
        try{
            $ingredient->restore();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'restore_ingredient_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully restored');
    }

    public function ingredients(GetIngredientsRequest $request){
        $data = $request->validated();

        return response()->json([
            'message' => 'Success',
            'data' => $this->ingredientService->getData($data)
        ], 200);
    }

    public function lowStock(Request $request){
        return redirect()->route('ingredients.index', ['filter' => 'low_stock']);
    }

    public function checkCode(Request $request){
        $this->authorize('create', Ingredient::class);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z0-9\-_]+$/'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'except_ingredient_id' => ['nullable', 'integer', 'exists:ingredients,id'],
        ]);

        return response()->json([
            'available' => !$this->ingredientService->codeExists(
                $validated['code'],
                $validated['branch_id'],
                $validated['except_ingredient_id'] ?? null
            ),
        ]);
    }
}
