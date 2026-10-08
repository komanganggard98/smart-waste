<?php

namespace App\Services;

use App\Models\{IngredientBatch, StockConsumption, StockConsumptionTemplate};
use App\Repositories\IngredientBatchRepository;
use App\Repositories\StockConsumptionRepository;
use Illuminate\Support\Facades\{DB};
use Illuminate\Validation\ValidationException;

class StockConsumptionService
{
    public function __construct(
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected StockConsumptionRepository $stockConsumptionRepo
    ) {}

    public function getData($user, $request){
        return $this->stockConsumptionRepo->getData($user, $request);
    }
    public function store($user, array $payload): array
    {
        return DB::transaction(function () use ($user, $payload) {
            $consumptions = [];

            foreach ($payload['items'] as $index => $item) {
                $batch = IngredientBatch::with('ingredient:id,branch_id')
                    ->lockForUpdate()
                    ->findOrFail($item['ingredient_batch_id']);

                $branchId = $batch->ingredient->branch_id;

                if (!$user->hasRole('owner') && (int) $branchId !== (int) $user->branch_id) {
                    throw ValidationException::withMessages([
                        "items.$index.ingredient_batch_id" => 'The selected batch is not available for this user.',
                    ]);
                }

                if ((float) $batch->quantity_remaining < (float) $item['quantity']) {
                    throw ValidationException::withMessages([
                        "items.$index.quantity" => 'The consumption quantity cannot exceed the available stock.',
                    ]);
                }

                $consumptions[] = StockConsumption::create([
                    'branch_id' => $branchId,
                    'ingredient_batch_id' => $batch->id,
                    'user_id' => $user->id,
                    'consumption_date' => $payload['consumption_date'],
                    'quantity' => $item['quantity'],
                    'purpose' => $payload['purpose'],
                    'notes' => $payload['notes'] ?? null,
                ]);

                $this->ingredientBatchRepo->decrementBatchStock($batch, (float) $item['quantity']);
            }

            return $consumptions;
        });
    }
}