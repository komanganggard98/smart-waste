<?php 

namespace App\Services;
use App\Repositories\{BranchRepository, UserRepository};
use Illuminate\Support\Facades\{Cache, DB};
use App\Models\{User};
use App\Traits\NormalizesData;
use Spatie\Permission\Models\Role;

class UserService{
    use NormalizesData;
    protected $cacheTag;

    public function __construct(
        protected UserRepository $userRepo,
        protected BranchRepository $branchRepo,
        protected User $model
    ){
        $this->cacheTag = (new User())->getTable(); 
    }

    public function index($request){
        $request->merge([
            'with_branch' => true,
            'with_role' => true
        ]);
        $isOwner = $request->user()->hasRole('owner');
        if(!$isOwner){
            $request->merge([
                'branch_id' => $request->user()->branch_id
            ]);
        }
        return [
            'data' => $this->normalizeData($this->userRepo->getData($request)),
            'branches' => $request->user()->branch_id ? [] : $this->branchRepo->getData([],['*']),
            'filters' => (object)$request->only(['name','filter','branch_id']),
            'roles' => Role::all()
        ];
    }

    public function getData($request){
        return $this->normalizeData($this->userRepo->getData($request));
    }

    public function findData($id){
        return $this->normalizeData($this->userRepo->findData($this->model, $id));
    }

    public function store($payload){
        DB::transaction(function() use($payload) {
            $userPayload = collect($payload)->except(['role_id'])->toArray();
            $roleId = $payload['role_id'];
    
            $user = $this->userRepo->store($this->model, $userPayload);
            $this->userRepo->assignRoles($user, [$roleId]);
        });
    }

    public function update($payload, $userId){
        DB::transaction(function() use($payload, $userId){
            $userPayload = collect($payload)->except(['role_id'])->toArray();
            $roleId = $payload['role_id'];
    
            $user = $this->userRepo->update($this->model, $userPayload, $userId);
            $this->userRepo->assignRoles($user, [$roleId]);
        });
    }
}