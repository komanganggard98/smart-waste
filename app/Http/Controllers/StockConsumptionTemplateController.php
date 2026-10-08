<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{StockConsumptionTemplate};
use App\Services\StockConsumptionTemplateService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\StockConsumption\StoreStockConsumptionTemplateRequest;
use App\Http\Requests\StockConsumption\UpdateStockConsumptionTemplateRequest;
use App\Services\GeneralService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class StockConsumptionTemplateController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected StockConsumptionTemplateService $templateService,
        protected GeneralService $generalService
    ){
        $this->authorizeResource(StockConsumptionTemplate::class, 'stock_consumption_template');
    }
    //
    public function index(Request $request){
        return Inertia::render('StockConsumptionTemplate/Index',[
            'data' => $this->templateService->getData($request->user(), $request)
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        return Inertia::render('StockConsumptionTemplate/FormTemplate', $this->templateService->formPage($user, $request));
    }

    public function store(StoreStockConsumptionTemplateRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();

        try{
            $this->templateService->store($user, $data);
        }catch(\Exception $e){
            if ($wantsJson && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_template_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_template_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($wantsJson && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Data successfully created',
            ], 201);
        }

        return redirect()->route('stock-consumption-templates.index')->with('success', 'Stock consumption template created.');
    }

    public function edit(StockConsumptionTemplate $stockConsumptionTemplate){
        $data = $this->templateService->formPage(Auth::user(), []);
        $template = $stockConsumptionTemplate->load(['branch','items']);

        return Inertia::render('StockConsumptionTemplate/FormTemplate', [...$data, 'template' => $template ]);
    }

    public function update(UpdateStockConsumptionTemplateRequest $request, StockConsumptionTemplate $stockConsumptionTemplate)
    {
        $user = $request->user();
        $data = $request->validated();
        $wantsJson = $request->expectsJson() || $request->ajax();

        try{
            $this->templateService->update($user, $data, $stockConsumptionTemplate);
        }catch(\Exception $e){
            if ($wantsJson && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_template_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_template_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($wantsJson && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Data successfully created',
            ], 201);
        }

        return redirect()->route('stock-consumption-templates.index')->with('success', 'Stock consumption template created.');
    }

    public function delete(StockConsumptionTemplate $stockConsumptionTemplate){
        $stockConsumptionTemplate->delete();
        return redirect()->back()->with('success','Stock consumption template deleted');
    }

    public function activate(StockConsumptionTemplate $stockConsumptionTemplate){
        $this->authorize('update',StockConsumptionTemplate::class);
        try{
            $isActive = $this->templateService->activationTemplate($stockConsumptionTemplate);
        }catch(\Exception $e){
            throw ValidationException::withMessages([
                'activate_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Branch successfully' . $isActive ? 'deactivated' : 'activated');
    }
}
