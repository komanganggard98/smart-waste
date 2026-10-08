<?php

namespace App\Http\Requests\WasteLog;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\{Branch, IngredientBatch, WasteLog};

class UpdateWasteLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to update data
        // this function set in WasteLogPolicy.php

        // get User objek from URL parameter
        $waste_log = $this->route('waste_log');
        return $this->user()->can('update', $waste_log);
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
            'cost_loss' => ['required', 'numeric', 'min:0.01'],
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

    public function withFalidator($validator){
        $validator->after(function ($validator){
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
