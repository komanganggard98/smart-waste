<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockConsumption\{StoreStockConsumptionRequest, StoreStockConsumptionTemplateRequest};
use App\Services\{IngredientBatchService, StockConsumptionService, GeneralService};
use App\Models\{StockConsumptionTemplate, StockConsumption};
use App\Repositories\{BranchRepository, IngredientRepository};
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\{Inertia, Response};
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Validation\ValidationException;

class StockConsumptionController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected IngredientBatchService $ingredientBatchService,
        protected StockConsumptionService $stockConsumptionService,
        protected IngredientRepository $ingredientRepo,
        protected GeneralService $generalService,
        protected BranchRepository $branchRepo
    ) {
        $this->authorizeResource(StockConsumption::class, 'stock_consumption');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('StockConsumptions/Index',[
            'stock_consumptions' => $this->stockConsumptionService->getData($request->user(), $request)
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $templates = StockConsumptionTemplate::query()
            ->with('items.ingredient:id,branch_id,name,unit')
            ->when(!$user->hasRole('owner'), fn ($query) => $query->where('branch_id', $user->branch_id))
            ->orderBy('name')
            ->get();

        $branches = $user->hasRole('owner') ? $this->branchRepo->getData([]) : [];

        return Inertia::render('StockConsumptions/Create', [
            'available_batches' => $this->ingredientBatchService->availableBatches($user, $request),
            'templates' => $templates,
            'default_batch_id' => $request->integer('batch_id') ?: null,
            'default_branch_id' => $request->user()->branch_id,
            'branches' => $branches
        ]);
    }

    public function store(StoreStockConsumptionRequest $request)
    {
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();
        try{
            $this->stockConsumptionService->store($request->user(), $data);
        }catch(\Exception $e){
            if($wantsJson && !$request->header('X-Inertia')){
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_stock_consumption_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_stock_consumption_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if($wantsJson && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Stock usage recorded and inventory updated.',
            ], 201);
        }   
        
        return redirect()
            ->route('stock-consumptions.index')
            ->with('success', 'Stock usage recorded and inventory updated.');
    }
}