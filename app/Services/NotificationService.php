<?php 

namespace App\Services;

use App\Models\Notification;
use App\Repositories\IngredientRepository;
use App\Repositories\NotificationRepository;
use Illuminate\Support\Str;
use App\Events\LowStockAlert;


class NotificationService{
    protected $cacheTag;
    protected $lowStockCategory;
    protected $expiringStockCategory;

    public function __construct(
        protected NotificationRepository $notifRepo,
        protected IngredientRepository $ingredientRepo
    ){
        $this->lowStockCategory = 'LOW_STOCK';
        $this->expiringStockCategory = 'EXPIRY_STOCK';
    }


    // Dipanggil saat login untuk menyusun struktur data session
    public function getUnreadNotificationsForUser(int $userId): array
    {
        $readTokens = $this->notifRepo->getReadTokensByUser($userId);
        $unreadGroups = $this->notifRepo->getUnreadAlertsByGroup($readTokens);

        $formattedData = [];
        foreach ($unreadGroups as $token => $alerts) {
            $formattedData[] = [
                'batch_token' => $token,
                'time_ago' => $alerts->first()->created_at->diffForHumans(),
                'items' => $alerts->map(fn($alert) => [
                    'name' => $alert->ingredient->name,
                    'current_stock' => $alert->stock_at_alert
                ])->toArray()
            ];
        }

        return $formattedData;
    }

    public function markNotificationAsRead(int $userId, string $batchToken): void
    {
        $this->notifRepo->markAsRead($userId, $batchToken);
    }

    // Dipanggil lewat Cron Job / Event Perubahan Stok
    public function generateAlerts($branchId, $category): void
    {
        $ingredients = collect([]);
        if($category == $this->lowStockCategory){
            $ingredients = $this->ingredientRepo->getLowStock($branchId, ['id', 'name']);
        }else{
            $ingredients = $this->ingredientRepo->expiringIngredients($branchId, false, ['id','name']);
        }


        if ($ingredients->isEmpty()) {
            return;
        }

        // Cek batch aktif dalam 4 jam terakhir
        $recentNotif = $this->notifRepo->getRecentAlert(4, $this->lowStockCategory, $branchId);
        $batchToken = $recentNotif ? $recentNotif->batch_token : (string) Str::uuid();

        $notif = null;
        $totalIngredient = 0;
        foreach ($ingredients as $ingredient) {
            if($ingredient->batch_token == $batchToken){
                $totalIngredient++;
            }

            if (!$this->notifRepo->isIngredientAlertedInBatch($batchToken, $ingredient->id, $category)) {
                $newNotif = $this->notifRepo->store(Notification::class, [
                    'branch_id' => $branchId,
                    'ingredient_id' => $ingredient->id,
                    'batch_token' => $batchToken,
                    'category' => $category
                ]);

                if(!$notif){
                    $notif = $newNotif;
                    $notif->ingredient = $ingredient;
                }
            }
        }

        // kirim notif ke frontend
        if($notif){
            $ingredient = $notif->ingredient->name;            
            $notif->message = $this->setMessageNotif($ingredient, $totalIngredient, $category);

            broadcast(new LowStockAlert($notif));
        }
    }

    private function setMessageNotif($ingredient, $totalIngredients, $category){

        $verb = ($totalIngredients > 1) ? "are" : "is";
        if($totalIngredients > 1){
            $ingredient .= " and other ingredients";
        }

        return $category == $this->lowStockCategory ? "Stock for {$ingredient} {$verb} low. Please restock soon." : "Stock for {$ingredient} {$verb} will expire soon!";
    }
}