<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\{StoreUserRequest, UpdateUserRequest};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Repositories\{UserRepository};
use App\Services\{GeneralService, UserService};
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; 

class UserController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected GeneralService $generalService, 
        protected UserRepository $userRepo,
        protected UserService $userService,
        protected User $model
    ){
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request){
        $data = $this->userService->index($request);
        return Inertia::render('User/Index',$data);
    }

    public function show(User $user){
        try{
            $user = $this->userService->findData($user->id);
            return Inertia::render('User/Show',[
                'data' => $user,
            ]);
        }catch(Exception $e){
            return redirect()->route('dashboard')->with('error', $this->generalService->setErrorMessage($e));
        }
    }

    public function store(StoreUserRequest $request){
        $data = $request->validated();

        try{
            $this->userService->store($data);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'store_user_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('users.index')->with('success',' Data successfully created');
    }

    public function update(UpdateUserRequest $request, User $user){
        $data = $request->validated();

        try{
            $this->userService->update($data, $user->id);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'update_user_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('users.index')->with('success',' Data successfully updated');
    }

    public function destroy(User $user){
        try{
            $user->delete($user);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'delete_user_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('users.index')->with('success',' Data successfully deleted');
    }
}
