<?php

namespace App\Http\Requests\StockConsumption;

use App\Models\{Ingredient, StockConsumptionTemplate, Branch};
use Illuminate\Validation\Rule;
use App\Http\Requests\BaseFormRequest;

class StoreStockConsumptionTemplateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', StockConsumptionTemplate::class);
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required',Rule::exists(Branch::class,'id')],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_id' => ['required', 'integer', Rule::exists(Ingredient::class, 'id')],
            'items.*.default_quantity' => ['required', 'numeric', 'min:0.000001'],
            'name' => ['required', 'string', 'max:120'],
            'purpose' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();

            foreach ($this->input('items', []) as $index => $item) {
                $ingredient = Ingredient::query()->whereKey($item['ingredient_id'] ?? null)->first();

                if (!$ingredient || (!$user->hasRole('owner') && (int) $ingredient->branch_id !== (int) $user->branch_id)) {
                    $validator->errors()->add("items.$index.ingredient_id", 'The selected ingredient is not available for this user.');
                }
            }
        });
    }
}
