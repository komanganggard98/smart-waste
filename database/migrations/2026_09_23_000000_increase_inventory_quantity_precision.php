<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inventory quantities are always stored in an ingredient's base unit.
     * Six decimal places allow small quantities and an accurate cost per base unit.
     */
    public function up(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->decimal('minimum_stock', 18, 6)->default(0)->change();
        });

        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->decimal('purchase_quantity', 18, 6)->nullable()->change();
            $table->decimal('units_per_purchase', 18, 6)->nullable()->change();
            $table->decimal('quantity_received', 18, 6)->change();
            $table->decimal('quantity_remaining', 18, 6)->change();
            $table->decimal('unit_cost', 18, 6)->change();
        });

        Schema::table('stock_consumptions', function (Blueprint $table) {
            $table->decimal('quantity', 18, 6)->change();
        });

        Schema::table('stock_consumption_template_items', function (Blueprint $table) {
            $table->decimal('default_quantity', 18, 6)->change();
        });

        Schema::table('waste_logs', function (Blueprint $table) {
            $table->decimal('quantity', 18, 6)->change();
        });
    }

    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->decimal('minimum_stock', 10, 2)->default(0)->change();
        });

        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->decimal('purchase_quantity', 10, 2)->nullable()->change();
            $table->decimal('units_per_purchase', 10, 4)->nullable()->change();
            $table->decimal('quantity_received', 10, 2)->change();
            $table->decimal('quantity_remaining', 10, 2)->change();
            $table->decimal('unit_cost', 12, 2)->change();
        });

        Schema::table('stock_consumptions', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });

        Schema::table('stock_consumption_template_items', function (Blueprint $table) {
            $table->decimal('default_quantity', 10, 2)->change();
        });

        Schema::table('waste_logs', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });
    }
};
