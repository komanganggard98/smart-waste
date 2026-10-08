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
        Schema::create('waste_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            
            // Menggunakan foreignUuid() karena merujuk ke tabel batches yang bertipe UUID
            $table->foreignUuid('ingredient_batch_id')->constrained()->cascadeOnDelete(); 
            
            $table->foreignId('user_id')->constrained(); // Menghubungkan ke tabel users standar
            $table->dateTime('waste_date');
            $table->decimal('quantity', 10, 2);
            $table->enum('reason', ['expired', 'spoiled', 'spilled', 'wrong_prep']);
            $table->decimal('cost_loss', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_logs');
    }
};
