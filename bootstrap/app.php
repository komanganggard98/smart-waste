<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // 1. TANGKAP ERROR 403 (Gagal Middleware Otorisasi)
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            // Berikan UX yang aman: Redirect ke halaman utama dengan flash message
            return redirect()
                ->route('dashboard')
                ->with('error', "You don't have permission to access this page.");
        });

        // 2. TANGKAP ERROR 404 (Gagal Route Model Binding / findOrFail)
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            return redirect()
                ->route('dashboard')
                ->with('error', "The resource you requested could not be found.");
        });

    })->create();
