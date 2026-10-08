<?php

namespace App\Traits;

use App\Models\IngredientBatch;
use Illuminate\Support\Str;

trait BatchAutoFillTrait{
    /**
     * Boot logic untuk otomatis membuat nomor batch jika kosong
     */
    protected static function booted(): void
    {
        static::creating(function (IngredientBatch $batch) {
            if (empty($batch->batch_number)) {
                $today = now()->format('Ymd');
                $random = strtoupper(Str::random(4));
                
                // Format: BAT-20260723-A7X9
                $batch->batch_number = "BAT-{$today}-{$random}";
            }
            $batch->quantity_remaining = $batch->quantity_received;

            if ($batch->purchase_quantity && $batch->units_per_purchase) {
                $batch->quantity_received = round($batch->purchase_quantity * $batch->units_per_purchase, 6);
                $batch->quantity_remaining = $batch->quantity_received;
                $batch->unit_cost = $batch->quantity_received > 0
                    ? round($batch->purchase_total_cost / $batch->quantity_received, 6)
                    : 0;
            }
        });
    }
}
