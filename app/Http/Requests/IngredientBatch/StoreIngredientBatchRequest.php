<?php

namespace App\Http\Requests\IngredientBatch;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\{Ingredient, IngredientBatch};
use Illuminate\Validation\Rule;

class StoreIngredientBatchRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to create data
        // this function set in IngredientBatchPolicy.php
        return $this->user()->can('create', IngredientBatch::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ingredient_id' => 'required|exists:ingredients,id',
            // Regex: Hanya membolehkan huruf, angka, dash (-), dan underscore (_)
            'batch_number'  => ['nullable','string','max:50','regex:/^[a-zA-Z0-9\-_]+$/',  Rule::unique('ingredient_batches', 'batch_number')
            ->where(fn ($query) =>
                $query->where('ingredient_id', $this->input('ingredient_id'))
            )],
            'purchase_date' => 'required|date',
            'expiration_date' => 'required|date|after:purchase_date',
            'purchase_unit' => 'required|string|max:30',
            'purchase_quantity' => 'required|numeric|min:0.01',
            'units_per_purchase' => 'required|numeric|min:0.000001',
            'purchase_total_cost' => 'required|numeric|min:0',
            'quantity_received' => 'nullable|numeric|min:0.000001',
            'quantity_remaining' => 'nullable|numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('purchase_quantity') && $this->filled('units_per_purchase')) {
            $quantity = round((float) $this->input('purchase_quantity') * (float) $this->input('units_per_purchase'), 6);
            $totalCost = (float) $this->input('purchase_total_cost');

            $this->merge([
                'quantity_received' => $quantity,
                'quantity_remaining' => $quantity,
                'unit_cost' => $quantity > 0 ? round($totalCost / $quantity, 6) : 0,
            ]);
        }
    }

    public function messages(){
        return [
            'ingredient_id.exist' => 'The selected ingredient is invalid or not available for this system', 
            'batch_number.unique' => 'The batch is already exists', 
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $ingredient = Ingredient::query()->find($this->input('ingredient_id'));
            $user = $this->user();

            if ($ingredient && !$user->hasRole('owner') && (int) $ingredient->branch_id !== (int) $user->branch_id) {
                $validator->errors()->add('ingredient_id', 'The selected ingredient is not available for this user.');
            }
        });
    }
    
}
