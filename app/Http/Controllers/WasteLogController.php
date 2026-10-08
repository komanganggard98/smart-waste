<?php

namespace App\Http\Controllers;

use App\Http\Requests\WasteLog\StoreWasteLogRequest;
use App\Models\WasteLog;
use App\Repositories\WasteLogRepository;
use App\Services\{
    GeneralService,
    WasteLogService,
    IngredientBatchService
};
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WasteLogController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected WasteLogService $wasteLogService,
        protected GeneralService $generalService,
        protected IngredientBatchService $ingredientBatchService,
        protected WasteLogRepository $wasteLogRepo
    )
    {
        $this->authorizeResource(WasteLog::class, 'waste_log');
    }

    /**
     * Menampilkan daftar pencatatan waste log
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $wasteLogs = $this->wasteLogService->getData($user, $request);

        return Inertia::render('WasteLogs/Index', [
            'waste_logs' => $wasteLogs,
            'filters'   => $request->only(['start_date', 'end_date']),
        ]);
    }

    /**
     * Menampilkan form untuk mencatat waste log baru
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Ambil batch yang masih memiliki sisa stok di cabang user
        $availableBatches = $this->ingredientBatchService->availableBatches($user, $request);
        $requestedBatchId = $request->integer('batch_id');
        $defaultBatchId = $requestedBatchId > 0
            && collect($availableBatches)->contains('id', $requestedBatchId)
            ? $requestedBatchId
            : null;

        return Inertia::render('WasteLogs/Create', [
            'available_batches' => $availableBatches,
            'default_batch_id' => $defaultBatchId,
            'default_branch_id' => $user->branch_id,
        ]);
    }

    /**
     * Menyimpan data waste log baru & memotong stok di ingredient_batches
     */
    public function store(StoreWasteLogRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $wantsJson = $request->expectsJson() || $request->ajax();

        try{
            $this->wasteLogService->store($user, $data);
        }catch(Exception $e){
            if($wantsJson && !$request->header('X-inertia')){
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_waste_log_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_waste_log_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if($wantsJson && !$request->header('X-inertia')){
            return response()->json([
                'message' => 'Data successfully created',
            ]);
        }

        return redirect()
            ->route('waste-logs.index')
            ->with('success', 'Waste log created and inventory updated successfully.');
    }

    /**
     * Menampilkan detail item waste log
     */
    public function show(WasteLog $wasteLog): Response
    {
        $wasteLog->load([
            'branch:id,name',
            'ingredientBatch.ingredient:id,name,unit',
        ]);

        return Inertia::render('WasteLogs/Show', [
            'waste_log' => $wasteLog,
        ]);
    }

    /**
     * Menghapus catatan waste log dan mengembalikan sisa stok ke batch
     */
    public function destroy(WasteLog $wasteLog): RedirectResponse
    {
        try{
            $wasteLog->delete($wasteLog);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'delete_waste_log_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()
            ->route('waste-logs.index')
            ->with('success', 'Pencatatan waste berhasil dihapus dan stok telah dikembalikan.');
    }
}