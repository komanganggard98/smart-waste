<?php

namespace App\Repositories;
use App\Models\Notification;
use App\Models\NotificationUserRead;
use Illuminate\Support\Collection;

class NotificationRepository extends BaseRepository
{
    public function getData($branchId, $request){
        return Notification::query()
            ->with(['branch:id,name'])
            // Filter berdasarkan cabang jika bukan Owner
            ->when($branchId, function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->latest()
            ->when(!blank($request['limit'] ?? null), fn($q) => $q->limit($request['limit']))
            ->when(!blank($request['is_paginate'] ?? null),
                fn($q) => $q->paginate(20),
                fn($q) => $q->get()
            );
    }

    public function findNotif($request){
        return Notification::query()
        ->when($request->id, fn($q, $id) => $q->where('id', $id))
        ->when($request->ingredient_id, fn($q, $ingredientId) => $q->where('ingredient_id', $ingredientId))
        ->when($request->batch_token, fn($q, $batch) => $q->where('batch_token', $batch))
        ->when($request->branch_id, fn($q, $branchId) => $q->where('branch_id', $branchId))
        ->when($request->category, fn($q, $category) => $q->where('category', $category))
        ->when($request->boolean('latest'), fn($q) => $q->latest())
        ->first();
    }

    public function markAsRead(int $userId, string $batchToken): object
    {
        return NotificationUserRead::firstOrCreate([
            'user_id' => $userId,
            'batch_token' => $batchToken
        ]);
    }

    public function isIngredientAlertedInBatch(string $batchToken, int $ingredientId, string $category): bool
    {
        return $this->findNotif((object)[
            'batch_token' => $batchToken,
            'ingredient_id' => $ingredientId,
            'category' => $category
        ]) !== null;
    }

    public function getRecentAlert(int $hoursLimit, $category, $branchId): ?object
    {
        return Notification::where('created_at', '>=', now()->subHours($hoursLimit))
            ->where('category', $category)
            ->orderBy('created_at', 'desc')
            ->first();
    }

    public function getReadTokensByUser($userId){
        return NotificationUserRead::where('user_id', $userId)
        ->pluck('batch_token')
        ->toArray();
    }

    public function getUnreadAlertsByGroup(array $readTokens): Collection
    {
        return Notification::with('ingredient')
            ->whereNotIn('batch_token', $readTokens)
            ->get()
            ->groupBy('batch_token');
    }

}