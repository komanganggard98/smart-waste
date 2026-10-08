<?php

namespace App\Traits;

trait NormalizesData
{
    protected function normalizeData($data)
    {
        if ($data instanceof \Illuminate\Database\Eloquent\Collection) {
            return $data->map(fn ($item) => $item->toArray())->values()->all();
        }

        if ($data instanceof \Illuminate\Support\Collection) {
            return $data->map(fn ($item) => is_array($item) ? $item : (method_exists($item, 'toArray') ? $item->toArray() : $item))->values()->all();
        }

        if ($data instanceof \Illuminate\Database\Eloquent\Model) {
            return $data->toArray();
        }

        return $data;
    }
}
