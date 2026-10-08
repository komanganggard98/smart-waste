<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    )
    {}

    public function dashboard(Request $request){
        $user = $request->user();
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        return  Inertia::render('Dashboard',[
            'metrics' => $this->dashboardService->getData($user, $startDate, $endDate),
            'error' => session('error'),
            'success' => session('success'),
        ]);
    }
}
