<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{Schema, DB};
use Illuminate\Support\Str;

return new class extends Migration
{
    protected array $tables = ['users', 'branches', 'ingredients', 'waste_logs'];
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach($this->tables as $tableName){
            Schema::table($tableName, function (Blueprint $table) {
                // 1. Tambahkan kolom uuid (nullable dulu agar tidak error saat diisi data lama)
                $table->uuid('uuid')->nullable()->after('id')->unique();
            });

            // 2. Isi nilai UUID untuk data lama yang sudah terlanjur ada di database
            $records = DB::table($tableName)->whereNull('uuid')->get();
            foreach ($records as $record) {
                DB::table($tableName)
                    ->where('id', $record->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('uuid');
            });
        }
    }
};
