<?php 

namespace App\Services;
use App\Repositories\IngredientRepository;
use App\Repositories\WasteLogRepository;
use App\Services\BranchService;
use App\Models\User;

class DashboardService{

    public function __construct(
        protected WasteLogRepository $wasteLogRepo,
        protected BranchService $branchService,
        protected IngredientRepository $ingredientRepo,
    ){}

    public function getData(User $user, ?string $startDate = null, ?string $endDate = null): array
    {
        // Tentukan branch_id (null jika Owner untuk mengambil semua cabang)
        $branchId = $user->hasRole('owner') ? null : $user->branch_id;

        $data = [
            'totalIngredients'    => $this->ingredientRepo->totalIngredients($branchId),
            'expiringIngredients' => $this->ingredientRepo->expiringIngredients($branchId),
            'lowStockIngredients' => $this->ingredientRepo->lowStock($branchId),
            'allMovements' => $this->ingredientRepo->getAllMovements($branchId)
        ];

        // Tambahkan data spesifik untuk Owner
        if ($user->hasRole('owner')) {
            $data['branchPerformance'] = $this->branchService->getBranchPerformance($startDate, $endDate);
            $data['totalWasteCost']    = $this->wasteLogRepo->totalWasteCost($startDate, $endDate);
        }

        return $data;
    }
}   