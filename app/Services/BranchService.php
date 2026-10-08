<?php 

namespace App\Services;

use App\Http\Resources\LowStockResource;
use App\Repositories\{BranchRepository, IngredientBatchRepository, IngredientRepository, WasteLogRepository};
use Illuminate\Http\Request;
use App\Models\Branch;
use App\Traits\NormalizesData;

class BranchService{
    use NormalizesData;


    public function __construct(
        protected BranchRepository $branchRepo,
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected IngredientRepository $ingredientRepo,
        protected WasteLogRepository $wasteLogRepo,
        protected WasteLogService $wasteLogService,
        protected Branch $model
    ){
    }

    public function getData($request)
    {

        if ($request instanceof Request) {
            $queryParams = $request->query->all();
        } elseif (is_array($request)) {
            $queryParams = $request;
        } else {
            $queryParams = [];
        }

        return $this->normalizeData($this->branchRepo->getData($queryParams));
    }

    public function findData($id)
    {
        return $this->normalizeData($this->branchRepo->findData($this->model, $id));
    }

    public function getBranchPerformance($startDate, $endDate): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        $branches = $this->branchRepo->getData(['is_paginate' => false]); 

        return $branches
            ->map(function ($branch) use ($startDate, $endDate) {
                // 1. Total Nilai Kerugian Waste
                $totalWasteCost = $this->wasteLogRepo->totalWasteCost($startDate, $endDate, $branch->id);

                // 2. Total Nilai Stok Diterima (untuk hitung Waste Ratio)
                $totalStockReceivedCost = $this->ingredientBatchRepo->totalStockReceivedCost($branch->id, $startDate, $endDate);

                // 3. Waste Ratio (%)
                $wasteRatio = $this->wasteLogService->wasteRatio($totalStockReceivedCost, $totalWasteCost);

                // 4. Total Nilai Aset Stok Saat Ini (Sisa Bahan di Gudang)
                $currentStockValue = $this->ingredientBatchRepo->currentStockValue($branch->id);

                // 5. Batch Hampir Kadaluarsa (7 Hari ke depan)
                $nearExpiryCount = $this->ingredientBatchRepo->nearExpiry($branch->id, true);

                return [
                    'branch_id'             => $branch->id,
                    'branch_name'           => $branch->name,
                    'branch_code'           => $branch->code,
                    'total_waste_cost'      => (float) $totalWasteCost,
                    'total_received_cost'   => (float) $totalStockReceivedCost,
                    'waste_ratio_percentage'=> $wasteRatio,
                    'current_stock_value'   => (float) $currentStockValue,
                    'near_expiry_count'     => $nearExpiryCount,
                    'performance_status'    => $this->calculateBranchStatus($wasteRatio),
                ];
            })
            ->sortByDesc('total_waste_cost') // Urutkan cabang dari yang waste-nya paling tinggi
            ->values()
            ->toArray();
    }

    /**
     * Menentukan indikator warna/status cabang berdasarkan Waste Ratio
     */
    public function calculateBranchStatus(float $wasteRatio): string
    {
        if ($wasteRatio <= 2.0) {
            return 'GOOD'; // Hijau (Sangat Efisien)
        } elseif ($wasteRatio <= 5.0) {
            return 'WARNING'; // Kuning (Perlu Perhatian)
        }

        return 'DANGER'; // Merah (Boros / Perlu Audit)
    }

    public function getBranchAlerts($branchId = null){
        $alerts = collect();

        // 1. Alert Bahan Baku Low Stock (Di bawah minimum stock)
        $lowStockAlerts = LowStockResource::collection($this->ingredientRepo->getLowStock($branchId));
        $alerts = $alerts->merge($lowStockAlerts);
        
        // 2. Alert Batch Hampir Kadaluarsa (Near Expiry <= 7 Hari)
        $nearExpiryAlerts = $this->ingredientBatchRepo->nearExpiry($branchId, false);
        $alerts = $alerts->merge($nearExpiryAlerts);

        // 3. Alert Waste Tinggi (Waste Ratio > 5% dalam 30 hari terakhir)
        $highWasteAlerts = $this->getHighWasteAlerts($branchId);
        $alerts = $alerts->merge($highWasteAlerts);

        // Urutkan alert berdasarkan tingkat keparahan (CRITICAL -> WARNING -> INFO)
        return $alerts->sortBy(fn ($alert) => $this->getPriorityOrder($alert['type']))->values()->toArray();
    }

    private function getHighWasteAlerts($branchId = null, $startDate = null, $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        $branches = $this->branchRepo->getData(['is_paginate' => false, 'id' => $branchId]); 

        return $branches
            ->map(function ($branch) use ($startDate, $endDate) {
                // 1. Total Nilai Kerugian Waste
                $totalWasteCost = $this->wasteLogRepo->totalWasteCost($startDate, $endDate, $branch->id);

                // 2. Total Nilai Stok Diterima (untuk hitung Waste Ratio)
                $totalStockReceivedCost = $this->ingredientBatchRepo->totalStockReceivedCost($branch->id, $startDate, $endDate);

                // 3. Waste Ratio (%)
                $wasteRatio = $this->wasteLogService->wasteRatio($totalStockReceivedCost, $totalWasteCost);

                if ($wasteRatio > 5.0) {
                    return [
                        'id'          => "high-waste-{$branch->id}",
                        'type'        => 'WARNING',
                        'category'    => 'HIGH_WASTE',
                        'branch_name' => $branch->name,
                        'title'       => "Tingkat Waste Cabang Tinggi ({$wasteRatio}%)",
                        'message'     => "Cabang {$branch->name} mencatatkan kerugian waste sebesar Rp " . number_format($totalWasteCost, 0, ',', '.') . " dalam 30 hari terakhir (Ratio: {$wasteRatio}%).",
                        'action_url'  => route('waste-logs.index', ['branch_id' => $branch->id]),
                    ];
                }

                return null;
            })
            ->filter()
            ->values();
    }

    /**
     * Urutan prioritas tampilan alert
     */
    private function getPriorityOrder(string $type): int
    {
        return match ($type) {
            'CRITICAL' => 1,
            'WARNING'  => 2,
            'INFO'     => 3,
            default    => 4,
        };
    }

    public function activationBranch($branch){
        $isActive = $branch->is_active;
        $branch->update(['is_active' => !$isActive]);

        return $isActive;
    }


}