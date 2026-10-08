<?php

namespace App\Http\Requests\StockConsumption;

use App\Http\Requests\BaseFormRequest;
use App\Models\{Branch, IngredientBatch, StockConsumption};
use Illuminate\Validation\Rule;

class StoreStockConsumptionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', StockConsumption::class);
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', Rule::exists(Branch::class, 'id')],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_batch_id' => ['required', 'integer', Rule::exists(IngredientBatch::class, 'id')],
            'items.*.quantity' => ['required', 'numeric', 'min:0.000001'],
            'consumption_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after_or_equal:' . now()->subDays(3)->toDateString(),
            ],
            'purpose' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $branchId = (int) $this->input('branch_id');

            if (!$user->hasRole('owner') && (int) $user->branch_id !== $branchId) {
                $validator->errors()->add('branch_id', 'The selected branch is not available for this user.');
            }

            foreach ($this->input('items', []) as $index => $item) {
                $batch = IngredientBatch::with('ingredient:id,branch_id')
                    ->find($item['ingredient_batch_id'] ?? null);

                if (!$batch || !$batch->ingredient || (int) $batch->ingredient->branch_id !== $branchId) {
                    $validator->errors()->add("items.$index.ingredient_batch_id", 'The selected batch does not belong to the selected branch.');
                }
            }
        });
    }
}
