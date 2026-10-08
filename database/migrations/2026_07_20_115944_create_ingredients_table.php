<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 100);
            $table->string('unit', 20); // 'kg', 'g', 'liter', 'ml', 'pcs'
            $table->decimal('minimum_stock', 10, 2)->default(0);
            $table->integer('expiry_alert_days')->default(3);
            $table->timestamps();

            // Kode unik per cabang agar tidak ada duplikasi bahan di cabang yang sama
            $table->unique(['branch_id', 'code']);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
