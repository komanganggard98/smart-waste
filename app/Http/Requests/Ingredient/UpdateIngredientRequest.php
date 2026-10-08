<?php

namespace App\Http\Requests\Ingredient;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use App\Models\{Branch, Ingredient};


class UpdateIngredientRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to update data
        // this function set in UserPolicy.php

        // get User objek from URL parameter
        $ingredient = $this->route('ingredient');
        return $this->user()->can('update', $ingredient);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $ingredient = $this->route('ingredient');

        return [
            'branch_id' => ['nullable', 'numeric', Rule::exists(Branch::class, 'id')],
            'name' => ['required','string','min:2', Rule::unique(Ingredient::class, 'name')->ignore($ingredient?->id)],
            'code' => ['required','string', Rule::unique(Ingredient::class, 'code')->ignore($ingredient?->id)],
            'unit' => ['required', Rule::in(['ml', 'g', 'pcs'])],
            'minimum_stock' => ['required','numeric','min:0'],
            'expiry_alert_days' => ['required','numeric','min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.exist' => 'The selected branch is invalid or not available for this system', 
            'name.min' => 'The name must be at least 3 characters long.', 
            'name.unique' => 'This igredient name is already exists.', 
        ];
    }
}
