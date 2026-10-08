<?php

namespace App\Http\Requests\WasteLog;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use App\Models\{IngredientBatch, Branch, WasteLog};

class StoreWasteLogRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to create data
        // this function set in WasteLogPolicy.php
        return $this->user()->can('create', WasteLog::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'numeric', Rule::exists(Branch::class, 'id')],
            'ingredient_batch_id' => ['required', 'numeric', Rule::exists(IngredientBatch::class, 'id')],
            'waste_date' => [
                'required',
                'date',
                'before_or_equal:today', // Tidak boleh tanggal masa depan
                'after_or_equal:' . now()->subDays(3)->toDateString(), // Maksimal backdate 3 hari
            ],
            'quantity' => ['required', 'numeric', 'min:0.000001'],
            'reason' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'waste_date.before_or_equal' => 'The waste date cannot exceed today.',
            'waste_date.after_or_equal'  => 'Back-dated recording is permitted for up to 3 days prior.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $batch = IngredientBatch::with('ingredient:id,branch_id')
                ->find($this->input('ingredient_batch_id'));

            if (!$batch || !$batch->ingredient) {
                return;
            }

            $user = $this->user();
            $branchId = (int) $this->input('branch_id');
            $quantity = $this->input('quantity');

            if (!$user->hasRole('owner') && (int) $user->branch_id !== $branchId) {
                $validator->errors()->add('branch_id', 'The selected branch is not available for this user.');
            }

            if ((int) $batch->ingredient->branch_id !== $branchId) {
                $validator->errors()->add('ingredient_batch_id', 'The selected batch does not belong to the selected branch.');
            }

            if($quantity > $batch->quantity_remaining){
                $validator->errors()->add('quantity', "The requested quantity exceeds the available batch stock ({$batch->quantity_remaining} remaining).");
            }
        });
    }
}
