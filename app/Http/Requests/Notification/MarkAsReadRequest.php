<?php

namespace App\Http\Requests\Notification;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\{User, Notification};
use Spatie\Permission\Models\Role;

class MarkAsReadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'batch_token' => ['required', 'string', Rule::exists(Notification::class, 'batch_token')],
        ];
    }

    public function messages(): array
    {
        return [
            'batch_token.exists'  => 'Notification does not exist.',
        ];
    }
}
