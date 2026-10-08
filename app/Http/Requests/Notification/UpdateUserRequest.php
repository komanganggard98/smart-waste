<?php

namespace App\Http\Requests\Branch;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\{Branch, User};
use Spatie\Permission\Models\Role;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // user who allowed to update data
        // this function set in UserPolicy.php

        // get User objek from URL parameter
        $user = $this->route('user');
        return $this->user()->can('update', $user);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required','string','min:3'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'branch_id' => ['nullable', 'numeric', Rule::exists(Branch::class, 'id')],
            'role_id' => ['required','numeric', Rule::exists(Role::class, 'id')->where(function ($query) {
                return $query->where('guard_name', 'web');
            })]
        ];
    }

    public function messages(): array
    {
        return [
            // Name messages
            'name.required' => 'Please enter your name.',
            'name.string'   => 'The name must be valid text.',
            'name.min'      => 'The name must be at least 3 characters long.',

            // Email messages
            'email.required' => 'Please enter your email address.',
            'email.string'   => 'The email must be valid text.',
            'email.email'    => 'Please enter a valid email address.',
            'email.max'      => 'The email address is too long.',
            'email.unique'   => 'This email address is already registered.',

            // Branch ID messages
            'branch_id.numeric' => 'The selected branch is invalid.',
            'branch_id.exists'  => 'The selected branch does not exist.',

            // Role ID messages
            'role_id.required' => 'Please select a role.',
            'role_id.numeric'  => 'The selected role is invalid.',
            'role_id.exists'   => 'The selected role is invalid or not available for this system.',
        ];
    }
}
