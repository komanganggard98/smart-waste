<?php

namespace Tests\Feature;

use App\Http\Requests\Ingredient\StoreIngredientRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class IngredientBatchValidationTest extends TestCase
{
    public function test_batch_fields_are_optional_when_with_batch_is_false(): void
    {
        $data = [
            'name' => 'Ingredient Without Batch',
            'code' => 'ING-001',
            'unit' => 'kg',
            'minimum_stock' => 10,
            'expiry_alert_days' => 3,
            'with_batch' => false,
        ];

        $validator = Validator::make($data, (new StoreIngredientRequest())->rules());

        $this->assertFalse($validator->fails(), 'Batch fields should be optional when with_batch is false.');
    }

    public function test_batch_fields_are_required_when_with_batch_is_true(): void
    {
        $data = [
            'name' => 'Ingredient With Batch',
            'code' => 'ING-002',
            'unit' => 'kg',
            'minimum_stock' => 10,
            'expiry_alert_days' => 3,
            'with_batch' => true,
        ];

        $validator = Validator::make($data, (new StoreIngredientRequest())->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('purchase_date', $validator->errors()->toArray());
        $this->assertArrayHasKey('expiration_date', $validator->errors()->toArray());
        $this->assertArrayHasKey('quantity_remaining', $validator->errors()->toArray());
        $this->assertArrayHasKey('quantity_received', $validator->errors()->toArray());
        $this->assertArrayHasKey('unit_cost', $validator->errors()->toArray());
    }
}
