<?php

namespace App\Http\Requests\IngredientBatch;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIngredientBatchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to update data
        // this function set in IngredientBatchPolicy.php

        // get User objek from URL parameter
        $ingredient_batch = $this->route('ingredient_batch');
        return $this->user()->can('update', $ingredient_batch);
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
            'batch_number'  => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\-_]+$/', 
                Rule::unique('ingredient_batches', 'batch_number')
                ->where(fn ($query) =>
                    $query->where('ingredient_id', $this->input('ingredient_id'))
                )
                ->ignore($this->route('ingredient_batch')->id)
            ],
            'purchase_date' => 'required|date',
            'expiration_date' => 'required|date|after:purchase_date',
            'quantity_received' => 'required|numeric|min:0.000001',
            'unit_cost'     => 'required|numeric|min:0',
        ];
    }

    public function messages(){
        return [
            'ingredient_id.exist' => 'The selected ingredient is invalid or not available for this system', 
            'batch_number.unique' => 'The batch is already exists', 
        ];
    }
}
