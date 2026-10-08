<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 */
trait ClearsCache
{
    /**
     * Fungsi boot khusus Trait di Laravel.
     * Nama fungsi wajib diawali dengan kata 'boot' diikuti nama Trait-nya.
     * Trait ini hanya akan berjalan pada operasi single-model Eloquent, dan tetap akan LEWAT jika Anda menggunakan direct bulk query
     */
    protected static function bootClearsCache(): void
    {
        static::saved(function ($model) {
            $model->clearCustomCache();
        });

        static::deleted(function ($model) {
            $model->clearCustomCache();
        });
    }

    /**
     * Logika untuk membersihkan cache secara dinamis.
     */
    public function clearCustomCache(): void
    {
        // Ambil nama tabel otomatis (misal: 'ingredients')
        $tableName = $this->getTable();
        $id = $this->id ?? null;
        $branchId = $this->branch_id ?? null;
        $tags = [$tableName, 'branch:all'];

        if ($id) {
            $tags[] = "$tableName:{$id}";
        }

        if ($branchId) {
            $tags[] = "branch:{$branchId}";
        }

        // Hapus SEMUA cache yang diberi tag nama tabel ini secara instan
        Cache::tags($tags)->flush();
    }
}

