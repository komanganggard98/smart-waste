<?php

namespace App\Jobs;

use App\Repositories\IngredientBatchRepository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Branch;
use App\Services\NotificationService;

class NotifyNearExpiry implements ShouldQueue
{
    use Queueable;
    protected $signature = 'app:near-expiry-notification';

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected NotificationService $notifService
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $branches = Branch::all();
        foreach($branches as $branch){
            $this->notifService->generateAlerts($branch->id, 'EXPIRY_STOCK');
        }
    }
}
