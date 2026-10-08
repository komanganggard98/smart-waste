<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

trait HasCustomUuid
{
    use HasUuids;

    /**
     * Tentukan kolom mana yang diisi UUID secara otomatis
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * Gunakan kolom 'uuid' untuk Route Model Binding (URL)
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}

