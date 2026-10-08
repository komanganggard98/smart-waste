<?php


namespace App\Services;
use App\Repositories\{StockConsumptionTemplateRepository, IngredientRepository, BranchRepository};
use Illuminate\Support\Facades\DB;

class StockConsumptionTemplateService {
    public function __construct(
        protected StockConsumptionTemplateRepository $templateRepo,
        protected IngredientRepository $ingredientRepo,
        protected BranchRepository $branchRepo
    ){}

    public function getData($user, $request){
        return $this->templateRepo->getData($user, $request);
    }

    public function formPage($user, $request){
        $ingredients = [];
        $branches = [];
        if(!$user->hasRole('owner')){
            $request->merge(['branch_id' => $user->branch_id]);
        }

        $ingredients = $this->ingredientRepo->getData($request, ['id', 'branch_id', 'name', 'unit']);
        $branches = $this->branchRepo->getData($request, ['id', 'name', 'address','is_active']);

        return [
            'ingredients' => $ingredients,
            'branches' => $branches,
        ];
    }

    public function store($user, $payload)
    {
        return DB::transaction(function () use ($user, $payload) {
            $template = $this->templateRepo->storeTemplate([
                'branch_id' => $user->branch_id ?? $payload['branch_id'],
                'name' => $payload['name'],
                'purpose' => $payload['purpose'],
                'notes' => $payload['notes'] ?? null,
            ]);

            foreach ($payload['items'] as $item) {
                $template->items()->create([
                    'ingredient_id' => $item['ingredient_id'],
                    'default_quantity' => $item['default_quantity'],
                ]);
            }

            return $template;
        });
    }

    public function update($user, $payload, $template)
    {
        return DB::transaction(function () use ($user, $payload, $template) {

            $items = $payload['items'];
            // 1. Extract IDs from the request to know what to keep
            $keepIds = collect($items)->pluck('id')->filter()->toArray();

            // 2. Delete any existing comments NOT present in the request
            $template->comments()->whereNotIn('id', $keepIds)->delete();

            $data = $template->update([
                'branch_id' => $user->branch_id ?? $payload['branch_id'],
                'name' => $payload['name'],
                'purpose' => $payload['purpose'],
                'notes' => $payload['notes'] ?? null,
            ]);

            foreach ($payload['items'] as $item) {
                $data->items()->updateOrCreate([
                    'id' => $item['id'] ?? null
                ],[
                    'ingredient_id' => $item['ingredient_id'],
                    'default_quantity' => $item['default_quantity'],
                ]);
            }

            return $data;
        });
    }

    public function activationTemplate($template){
        $isActive = $template->is_active;
        $template->update(['is_active' => !$isActive]);

        return $isActive;
    }
}