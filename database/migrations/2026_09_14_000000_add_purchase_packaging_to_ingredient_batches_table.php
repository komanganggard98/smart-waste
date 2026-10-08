<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->string('purchase_unit', 30)->nullable()->after('expiration_date');
            $table->decimal('purchase_quantity', 10, 2)->nullable()->after('purchase_unit');
            $table->decimal('units_per_purchase', 10, 4)->nullable()->after('purchase_quantity');
            $table->decimal('purchase_total_cost', 12, 2)->nullable()->after('units_per_purchase');
        });

        DB::table('ingredient_batches')->update([
            'purchase_unit' => 'unit',
        ]);
        DB::statement('UPDATE ingredient_batches SET purchase_quantity = quantity_received, units_per_purchase = 1, purchase_total_cost = quantity_received * unit_cost');
    }

    public function down(): void
    {
        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_unit',
                'purchase_quantity',
                'units_per_purchase',
                'purchase_total_cost',
            ]);
        });
    }
};
