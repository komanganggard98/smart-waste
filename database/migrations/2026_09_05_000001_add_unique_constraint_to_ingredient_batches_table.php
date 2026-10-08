<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->unique(
                ['ingredient_id', 'batch_number'],
                'ingredient_batches_ingredient_id_batch_number_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->dropUnique('ingredient_batches_ingredient_id_batch_number_unique');
        });
    }
};
