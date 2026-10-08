<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('stock_consumption_template_items')) {
            Schema::create('stock_consumption_template_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('stock_consumption_template_id');
                $table->unsignedBigInteger('ingredient_id');
                $table->decimal('default_quantity', 10, 2);
                $table->timestamps();
            });
        }

        Schema::table('stock_consumption_template_items', function (Blueprint $table) {
            $table->foreign('stock_consumption_template_id', 'sct_items_template_fk')
                ->references('id')->on('stock_consumption_templates')->cascadeOnDelete();
            $table->foreign('ingredient_id', 'sct_items_ingredient_fk')
                ->references('id')->on('ingredients')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_consumption_template_items');
    }
};