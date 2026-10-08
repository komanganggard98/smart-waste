<?php 

namespace App\Services;

use App\Repositories\{IngredientBatchRepository};
use Illuminate\Support\Facades\{Cache};
use App\Models\{IngredientBatch};
use App\Traits\NormalizesData;

class IngredientBatchService{
    use NormalizesData;
    protected $cacheTag;

    public function __construct(
        protected IngredientBatchRepository $ingredientBatchRepo,
        protected IngredientBatch $model
    ){
        $this->cacheTag = (new IngredientBatch())->getTable(); 
    }

    public function getData($user, $request){
        return $this->normalizeData($this->ingredientBatchRepo->getData($user, $request));
    }

    public function findData($id){
        return $this->normalizeData($this->ingredientBatchRepo->findData($this->model, $id));
    }

    public function availableBatches($user, $request){

        return $this->normalizeData($this->ingredientBatchRepo->availableBatches($user, $request));
    }

}