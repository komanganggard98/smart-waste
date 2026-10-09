<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\{Schema, DB};
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {

        // 1. Ambil nama-nama foreign key yang benar-benar ada di database saat ini
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = SCHEMA() 
              AND TABLE_NAME = 'waste_logs' 
              AND CONSTRAINT_NAME = 'waste_logs_ingredient_batch_id_foreign'
        ");

        Schema::table('waste_logs', function (Blueprint $table) use ($foreignKeys) {
            // Hapus FK HANYA jika memang terdeteksi ada di MySQL
            if (!empty($foreignKeys)) {
                $table->dropForeign('waste_logs_ingredient_batch_id_foreign');
            }
        });

        // 2. Ubah tipe kolom
        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement()->change();
        });

        Schema::table('waste_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('ingredient_batch_id')->change();

            // 3. Pasang kembali Foreign Key
            $table->foreign('ingredient_batch_id')
                  ->references('id')
                  ->on('ingredient_batches')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
       
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = SCHEMA() 
              AND TABLE_NAME = 'waste_logs' 
              AND CONSTRAINT_NAME = 'waste_logs_ingredient_batch_id_foreign'
        ");

        Schema::table('waste_logs', function (Blueprint $table) use ($foreignKeys) {
            if (!empty($foreignKeys)) {
                $table->dropForeign('waste_logs_ingredient_batch_id_foreign');
            }
        });

        Schema::table('ingredient_batches', function (Blueprint $table) {
            $table->char('id', 36)->change();
        });

        Schema::table('waste_logs', function (Blueprint $table) {
            $table->char('ingredient_batch_id', 36)->change();

            $table->foreign('ingredient_batch_id')
                  ->references('id')
                  ->on('ingredient_batches')
                  ->onDelete('cascade');
        });
    }
};
