<?php

namespace App\Http\Requests\Ingredient;

use App\Models\Ingredient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetIngredientsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', Ingredient::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable','string'],
            'search' => ['nullable','string'],
            'filter' => ['nullable','in:low_stock,near_expiry'],
            'branch_id' => ['nullable', 'numeric'],
            'has_no_batch' => ['nullable', 'boolean'],
        ];
    }
}
