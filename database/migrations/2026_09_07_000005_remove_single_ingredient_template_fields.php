<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_consumptions', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn('template_id');
        });

        Schema::table('stock_consumption_templates', function (Blueprint $table) {
            $table->dropForeign(['ingredient_id']);
            $table->dropColumn('ingredient_id');
            $table->dropColumn('default_quantity');
        });
    }

    public function down(): void
    {
        Schema::table('stock_consumption_templates', function (Blueprint $table) {
            $table->foreignId('ingredient_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('default_quantity', 10, 2)->nullable();
        });

        Schema::table('stock_consumptions', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->constrained('stock_consumption_templates')->nullOnDelete();
        });
    }
};