<?php

namespace App\Http\Requests\Branch;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use App\Models\{Branch};

class UpdateBranchRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to update data
        // this function set in BranchPolicy.php

        // get Branch objek from URL parameter
        $branch = $this->route('branch');
        return $this->user()->can('update', $branch);
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
