<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NearExpiryResource extends JsonResource
{
     /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request):array
    {
        $daysLeft = (int) now()->startOfDay()->diffInDays($this->expiration_date, false);
        $isToday = $daysLeft === 0;
        return [
            'id'          => "expiry-{$this->id}",
            'type'        => $daysLeft <= 2 ? 'CRITICAL' : 'WARNING', // CRITICAL / WARNING / INFO
            'category'    => 'NEAR_EXPIRY',
            'branch_name' => $this->branch->name ?? 'Pusat',
            'title'       => "Batch {$this->batch_number} Hampir Kadaluarsa",
            'message'     => $isToday 
                ? "Bahan {$this->ingredient->name} (Sisa: {$this->quantity_remaining} {$this->ingredient->unit}) KADALUARSA HARI INI!"
                : "Bahan {$this->ingredient->name} (Sisa: {$this->quantity_remaining} {$this->ingredient->unit}) akan kadaluarsa dalam {$daysLeft} hari ({$this->expiration_date->format('d M Y')}).",
            'action_url'  => route('waste-logs.create', ['batch_id' => $this->id]),
        ];
    }
}