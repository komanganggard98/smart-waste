<?php

namespace App\Listeners;

use App\Services\NotificationService;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Session;

class SessionNotificationCheck
{
    /**
     * Create the event listener.
     */
    public function __construct(
        protected NotificationService $notificationService
    )
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // 2. Ambil batch token unik yang BELUM dibaca dari tabel alerts
        $notificationsData = $this->notificationService->getUnreadNotificationsForUser($user->id);

        // Simpan ke session agar bisa langsung dirender di view/dashboard setelah login redirect
        Session::flash('notifications', $notificationsData);
    }
}
