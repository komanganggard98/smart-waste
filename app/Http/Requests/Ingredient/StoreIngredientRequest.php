<?php

namespace App\Http\Requests\Ingredient;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use App\Models\{Ingredient, Branch};

class StoreIngredientRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to create data
        // this function set in IngredientPolicy.php
        return $this->user()->can('create', Ingredient::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $withBatch = $this->boolean('with_batch');

        return [
            'branch_id' => ['nullable', 'numeric', Rule::exists(Branch::class, 'id')],
            'name' => ['required',
                'string',
                'min:2', 
                Rule::unique(Ingredient::class, 'name')
                        ->where(fn ($query) => $query->where('branch_id', $this->input('branch_id'))),
            ],
            'code' => [
                'required',
                'string',
                Rule::unique(Ingredient::class, 'code')
                    ->where(fn ($query) => $query->where('branch_id', $this->input('branch_id'))),
            ],
            'unit' => ['required', Rule::in(['ml', 'g', 'pcs'])],
            'minimum_stock' => ['required','numeric','min:0'],
            'expiry_alert_days' => ['required','numeric','min:0'],
            'with_batch' => ['nullable','boolean'],
            'batch' => [Rule::requiredIf($withBatch), 'nullable', 'array'],
            'batch.batch_number'  => [Rule::requiredIf($withBatch), 'nullable', 'string', 'max:50', 'regex:/^[a-zA-Z0-9\-_]+$/'],
            'batch.purchase_date' => [Rule::requiredIf($withBatch), 'nullable', 'date'],
            'batch.expiration_date' => [Rule::requiredIf($withBatch), 'nullable', 'date', 'after_or_equal:batch.purchase_date', 'after:today'],
            'batch.purchase_unit' => [Rule::requiredIf($withBatch), 'nullable', 'string', 'max:30'],
            'batch.purchase_quantity' => [Rule::requiredIf($withBatch), 'nullable', 'numeric', 'min:0.01'],
            'batch.units_per_purchase' => [Rule::requiredIf($withBatch), 'nullable', 'numeric', 'min:0.000001'],
            'batch.purchase_total_cost' => [Rule::requiredIf($withBatch), 'nullable', 'numeric', 'min:0'],
            'batch.quantity_received' => ['nullable', 'numeric', 'min:0.000001'],
            'batch.unit_cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $batch = $this->input('batch');
        if (is_array($batch) && isset($batch['purchase_quantity'], $batch['units_per_purchase'])) {
            $quantity = round((float) $batch['purchase_quantity'] * (float) $batch['units_per_purchase'], 6);
            $totalCost = (float) ($batch['purchase_total_cost'] ?? 0);
            $batch['quantity_received'] = $quantity;
            $batch['quantity_remaining'] = $quantity;
            $batch['unit_cost'] = $quantity > 0 ? round($totalCost / $quantity, 6) : 0;
            $this->merge(['batch' => $batch]);
        }
    }

    public function messages(): array
    {
        return [
            'branch_id.exist' => 'The selected branch is invalid or not available for this system',
            'name.min' => 'The name must be at least 3 characters long.',
            'name.unique' => 'This ingredient name is already exists.',
            'batch.batch_number.required_if' => 'Batch number is required when batch tracking is enabled.',
            'batch.purchase_date.required_if' => 'Purchase date is required when batch tracking is enabled.',
            'batch.expiration_date.required_if' => 'Expiration date is required when batch tracking is enabled.',
            'batch.expiration_date.after_or_equal' => 'Expiration date must be on or after purchase date.',
            'batch.expiration_date.after' => 'Expiration date must be after today.',
            'batch.purchase_quantity.required_if' => 'Purchase quantity is required when batch tracking is enabled.',
            'batch.units_per_purchase.required_if' => 'Base units per purchase are required when batch tracking is enabled.',
            'batch.purchase_total_cost.required_if' => 'Total purchase cost is required when batch tracking is enabled.',
        ];
    }

}
