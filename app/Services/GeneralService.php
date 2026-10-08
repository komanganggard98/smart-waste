<?php 

namespace App\Services;
use Illuminate\Support\Facades\Cache;

class GeneralService{
    public function setErrorMessage($error, $message = "Oops Something Wrong! Please try again later."){
        return config('app.env') !== 'production' 
                ? $error->getMessage() . " in " . basename($error->getFile()) . " line " . $error->getLine()
                : $message;
    }
}