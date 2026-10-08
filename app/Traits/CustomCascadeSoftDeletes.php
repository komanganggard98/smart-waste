<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 */
trait CustomCascadeSoftDeletes
{
    /**
     * Boot trait untuk menangani cascading soft deletes & restoring secara dinamis.
     */
    protected static function bootCascadeSoftDeletes(): void
    {
        // 1. Tangani Event Deleting (Soft Delete & Force Delete)
        static::deleting(function (Model $model) {
            $cascadeRelations = $model->getCascadeDeletes();

            foreach ($cascadeRelations as $relationName) {
                if (! method_exists($model, $relationName)) {
                    continue; // Skip jika method relasi tidak ditemukan
                }

                $relation = $model->{$relationName}();

                if ($model->isForceDeleting()) {
                    // Jika Hard Delete / Force Delete
                    if (method_exists($relation, 'forceDelete')) {
                        $relation->forceDelete();
                    } else {
                        // Fallback jika relasi bukan Eloquent Relationship standard
                        foreach ($relation->get() as $child) {
                            $child->forceDelete();
                        }
                    }
                } else {
                    // Jika Soft Delete biasa
                    $relation->delete();
                }
            }
        });

        // 2. Tangani Event Restoring
        static::restoring(function (Model $model) {
            $cascadeRelations = $model->getCascadeDeletes();

            foreach ($cascadeRelations as $relationName) {
                if (! method_exists($model, $relationName)) {
                    continue;
                }

                $relation = $model->{$relationName}();

                // Restore anak-anak yang ter-soft delete
                if (method_exists($relation, 'restore')) {
                    $relation->restore();
                } else {
                    foreach ($relation->onlyTrashed()->get() as $child) {
                        $child->restore();
                    }
                }
            }
        });
    }

    /**
     * Ambil daftar nama relasi yang harus di-cascade dari properti model.
     */
    public function getCascadeDeletes(): array
    {
        return property_exists($this, 'cascadeDeletes') ? $this->cascadeDeletes : [];
    }
}

