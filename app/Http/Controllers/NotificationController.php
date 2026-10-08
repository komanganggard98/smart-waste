<?php

namespace App\Http\Controllers;

use App\Http\Requests\Notification\MarkAsReadRequest;
use App\Repositories\NotificationRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\NotificationUserRead;
use App\Services\NotificationService;
use Exception;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notifService,
        protected NotificationRepository $notifRepo
    )
    {}
    
    public function index(){
        $request = [
            (object)['is_paginate' => true]
        ];

        $data = $this->notifRepo->getData(Auth::user(), $request);
        return Inertia::render('Notification/Index',[
            'data' => $data
        ]);
    }

    public function notifications(Request $request){
        $data = $this->notifRepo->getData($request->user(), $request);
        return response()->json(['data' => $data], 200);
    }

     public function markAsRead(MarkAsReadRequest $request)
    {
        try{
            $validated = $request->validated();
    
            // Simpan ke database bahwa user ini sudah membaca batch notif ini
            $this->notifService->markNotificationAsRead(Auth::id(), $validated['batch_token']);

            return response()->json(['message' => 'Success'], 200);
        }catch(Exception $e){
            return response()->json(['message' => $e->getMessage()]);
        }

    }
}
