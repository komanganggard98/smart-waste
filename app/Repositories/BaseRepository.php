<?php

namespace App\Repositories;

class BaseRepository
{
    public function findData($classModel, $id){
        return $classModel::findOrFail($id);
    }

    public function store($classModel, $payload){
        return $classModel::create($payload);
    }

    public function update($classModel, $payload, $id){
        $data = $classModel::findOrFail($id);
        $data->update($payload);
        return $data->refresh();
    }

    public function updateByModel($model, $payload){
        $model->update($payload);
        return $model->refresh();
    }

    public function delete($classModel, $id){
        $data = $classModel::findOrFail($id);
        $data->delete(); 
    }

    public function deleteByModel($model){
        $model->delete();
    }

    public function destroy($classModel, $id){
        $data = $classModel::withTrashed()->findOrFail($id); 
        $data->forceDelete(); 
    }

    public function destroyByModel($model){
        $model->forceDelete();
    }
}