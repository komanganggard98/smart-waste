<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\{StoreBranchRequest, UpdateBranchRequest};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Branch;
use App\Repositories\{BranchRepository};
use App\Services\{GeneralService, BranchService};
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; 

class BranchController extends Controller
{
    use AuthorizesRequests;
    public function __construct(
        protected GeneralService $generalService, 
        protected BranchRepository $userRepo,
        protected BranchService $branchService,
    ){
        $this->authorizeResource(Branch::class, 'branch');
    }

    public function index(Request $request){
        $request->merge([
            'with_total_ingredients' => true,
            'is_paginate' => true
         ]);
        $branches = $this->branchService->getData($request);
        return Inertia::render('Branch/Index',[
            'data' => $branches,
            'filters' => (object)$request->only(['is_active', 'search', 'is_archive']),
        ]);
    }

    public function list(Request $request)
    {
        $branches = $this->branchService->getData($request);
        return response()->json(['data' => $branches], 200);
    }

    public function show(Branch $branch){
        return Inertia::render('Branch/Show',[
            'data' => $branch,
        ]);
    }

    public function store(StoreBranchRequest $request){
        $data = $request->validated();

        try{
            $branch = Branch::create($data);
        }catch(Exception $e){
            // Cek apakah request mengharapkan JSON
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Oops, something went wrong. Try again later!',
                    'errors' => [
                        'store_branch_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'store_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Data successfully created',
                'data' => $branch
            ], 201);
        }
        return redirect()->route('branches.index')->with('success',' Data successfully created');
    }

    public function update(UpdateBranchRequest $request, Branch $branch){
        $data = $request->validated();

        try{
            $branch->update($data);
        }catch(Exception $e){
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Terjadi kesalahan pada sistem.',
                    'errors' => [
                        'update_branch_error' => [$this->generalService->setErrorMessage($e)]
                    ]
                ], 422);
            }

            throw ValidationException::withMessages([
                'update_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json(['message' => 'Data successfully updated'], 200);
        }

        return redirect()->route('branches.index')->with('success',' Data successfully updated');
    }

    public function destroy(Branch $branch){
        try{
            $branch->delete($branch->id);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'delete_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->route('branches.index')->with('success',' Data successfully deleted');
    }

    public function forceDelete(Branch $branch){
        try{
            $branch->forceDelete();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'force_delete_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully deleted');
    }

    public function restore(Branch $branch){
        try{
            $branch->restore();
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'restore_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Data successfully restored');
    }

    public function activate(Branch $branch){
        $this->authorize('update',Branch::class);
        try{
            $isActive = $this->branchService->activationBranch($branch);
        }catch(Exception $e){
            throw ValidationException::withMessages([
                'activate_branch_error' => $this->generalService->setErrorMessage($e)
            ]);
        }

        return redirect()->back()->with('success',' Branch successfully' . $isActive ? 'deactivated' : 'activated');
    }
}
