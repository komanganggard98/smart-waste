<?php 

namespace App\Services;
use App\Repositories\{WasteLogRepository, IngredientBatchRepository};
use Illuminate\Support\Facades\DB;
use App\Models\{IngredientBatch, WasteLog};
use Illuminate\Validation\ValidationException;
use App\Traits\NormalizesData;

class WasteLogService{
    use NormalizesData;

    public function __construct(
        protected WasteLogRepository $wasteLogRepo,
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected NotificationService $notifService
    ){}

    public function getData($user, $request){
        return $this->normalizeData($this->wasteLogRepo->getData($user, $request));
    }

    public function findData($id){
        return $this->normalizeData($this->wasteLogRepo->findData(WasteLog::class, $id));
    }

    public function store($user, $payload){
        DB::transaction(function () use ($payload, $user) {
            // 1. Ambil instance batch bahan baku
            $batch = $this->ingredientBatchRepo->findData(IngredientBatch::class, $payload['ingredient_batch_id']);

            $batch->loadMissing('ingredient:id,branch_id');
            $batchBranchId = $batch->ingredient?->branch_id;

            if (!$batchBranchId || (!$user->hasRole('owner') && (int) $batchBranchId !== (int) $user->branch_id)) {
                throw ValidationException::withMessages([
                    'ingredient_batch_id' => 'The selected batch is not available for this user.',
                ]);
            }

            // Validasi manual agar stok tidak minus sebelum didecrement
            if ($batch->quantity_remaining < $payload['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok bahan baku tidak mencukupi untuk dicatat sebagai waste.'
                ]);
            }

            // 2. Hitung biaya kerugian (cost_loss = quantity_wasted * unit_cost_batch)
            $costLoss = $payload['quantity'] * $batch->unit_cost;

            // Pastikan relasi ingredient aman
            $branchId = $batchBranchId;

            // 3. Simpan data WasteLog
            $this->wasteLogRepo->store(WasteLog::class, [
                'branch_id'           => $branchId,
                'ingredient_batch_id' => $batch->id,
                'user_id'             => $user->id,
                'waste_date'          => $payload['waste_date'],
                'quantity'            => $payload['quantity'],
                'reason'              => $payload['reason'],
                'cost_loss'           => $costLoss,
                'notes'               => $payload['notes'],
            ]);

            // 4. Potong sisa stok di ingredient_batches secara eksplisit
            $this->ingredientBatchRepo->decrementBatchStock(
                $batch,
                $payload['quantity']
            );

            // 5. Kirim notifikasi jika jumlah stock kurang dari jumlah minimum_stock
            // $this->notifService->generateAlerts($branchId, 'LOW_STOCK');
        });
    }

    public function delete(WasteLog $wasteLog){
        DB::transaction(function () use ($wasteLog) {
            // 1. Kembalikan stok ke ingredient_batches jika batch masih ada
            if ($wasteLog->ingredientBatch) {
                $this->ingredientBatchRepo->restoreBatchStock(
                    $wasteLog->ingredientBatch,
                    (float) $wasteLog->quantity
                );
            }

            // 2. Hapus data WasteLog
            $wasteLog->delete($wasteLog);
        });
    }

    public function wasteRatio( $totalStockReceivedCost, $totalWasteCost ){
        return $totalStockReceivedCost > 0
                    ? round(($totalWasteCost / $totalStockReceivedCost) * 100, 2)
                    : 0;
    }

}
