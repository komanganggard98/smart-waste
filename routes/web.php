<?php

use App\Http\Controllers\{
    ProfileController,
    UserController,
    BranchController,
    IngredientController,
    IngredientBatchController,
    WasteLogController,
    NotificationController,
    DashboardController,
    StockConsumptionController,
    StockConsumptionTemplateController
};
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [AuthenticatedSessionController::class, 'create'])->middleware('guest');

// Route::get('/dashboard', function () {
//     return Inertia::render('StockFlowDashboard');
// })->name('dashboard');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    Route::resource('users', UserController::class);

    // ------------- BRANCHES ----------------
    Route::prefix('branches')->as('branches.')->group(function () {
        Route::get('/list', [BranchController::class, 'list'])->name('list');

        // Route khusus Soft Delete
        Route::post('/restore/{branch}', [BranchController::class, 'restore'])->name('restore');
        Route::delete('/force-delete/{branch}', [BranchController::class, 'forceDelete'])->name('force-delete');
        Route::post('/activate/{branch}', [BranchController::class, 'activate'])->name('activate');
    });

    // Main Resource Route
    Route::resource('branches', BranchController::class);


    // ------------- INGREDIENTS ----------------
    Route::prefix('ingredients')->as('ingredients.')->group(function () {
        // Route khusus Soft Delete
        Route::get('/list', [IngredientController::class, 'ingredients'])->name('list');
        Route::get('/check-code', [IngredientController::class, 'checkCode'])->name('check-code');
        Route::get('/low-stock', [IngredientController::class, 'lowStock'])->name('low-stock');
        // Route::post('{ingredient}/restore', [IngredientController::class, 'restore'])->name('restore');
        Route::delete('/force-delete/{ingredient}', [IngredientController::class, 'forceDelete'])->name('force-delete');
    });
    Route::resource('ingredients', IngredientController::class);


    // ------------- BATCHES ----------------
    Route::prefix('ingredient-batches')->as('ingredient-batches.')->group(function () {
        // Route khusus Soft Delete
        Route::get('/available', [IngredientBatchController::class, 'available'])->name('available');
        Route::post('/restore/{ingredient_batch}', [IngredientBatchController::class, 'restore'])->name('restore');
        Route::delete('/force-delete/{ingredient_batch}', [IngredientBatchController::class, 'forceDelete'])->name('force-delete');
    });
    Route::resource('ingredient-batches', IngredientBatchController::class);

    Route::prefix('notifications')->as('notifications.')->group(function(){
        Route::get('/',[NotificationController::class, 'index'])->name('index');
        Route::get('/list',[NotificationController::class, 'notifications'])->name('list');
        Route::post('/mark-as-read', [NotificationController::class, 'markAsRead'])->name('mark_as_read');
    });


    Route::resource('waste-logs', WasteLogController::class)->parameters(['waste-log' => 'waste_log']);

    Route::get('/stock-consumptions/index', [StockConsumptionController::class, 'index'])
        ->name('stock-consumptions.index');
    Route::get('/stock-consumptions/create', [StockConsumptionController::class, 'create'])
        ->name('stock-consumptions.create');
    Route::post('/stock-consumptions', [StockConsumptionController::class, 'store'])
        ->name('stock-consumptions.store');

    Route::prefix('stock-consumption-templates')->as('stock-consumption-templates.')->group(function(){
        Route::post('/activate/{template}', [StockConsumptionTemplateController::class, 'activate'])->name('activate');
    });
    
    Route::resource('stock-consumption-templates', StockConsumptionTemplateController::class);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
