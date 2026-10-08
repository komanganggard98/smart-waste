<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LowStockResource extends JsonResource
{
     /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request):array
    {
        $totalRemaining = $this->total_remaining ?? 0;
        return [
            'id'          => "low-stock-{$this->id}",
            'type'        => 'CRITICAL', // CRITICAL / WARNING / INFO
            'category'    => 'LOW_STOCK',
            'branch_name' => $this->branch->name ?? 'Pusat',
            'title'       => "Stok {$this->name} Kritis!",
            'message'     => "Sisa stok saat ini {$totalRemaining} {$this->unit} (Batas minimum: {$this->minimum_stock} {$this->unit}). Segera lakukan restock.",
            'action_url'  => route('ingredient-batches.create', ['ingredient_id' => $this->id]),
        ];
    }
}