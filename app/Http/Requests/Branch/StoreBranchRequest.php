<?php

namespace App\Http\Requests\Branch;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\{Branch};

class StoreBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to create data
        // this function set in BranchPolicy.php
        return $this->user()->can('create', Branch::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required','string','min:2', Rule::unique(Branch::class)],
            'address' => ['required','string','min:3'],
            'is_active' => ['required','boolean']
        ];
    }

    public function messages(): array
    {
        return [
            'name.min' => 'Name is too short', 
            'name.unique' => 'Name is already exists', 
            'address.min' => 'Address is too short', 
        ];
    }
}
