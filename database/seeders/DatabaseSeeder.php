<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\{Hash, Schema};

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Nonaktifkan foreign key check agar tidak error saat mengosongkan tabel
        Schema::disableForeignKeyConstraints();
        
        // 2. Kosongkan tabel users dan reset ID menjadi 1
        User::truncate();
        
        // 3. Aktifkan kembali foreign key check
        Schema::enableForeignKeyConstraints();
        
        $roles = ['owner', 'branch_manager', 'head_chef', 'kitchen_staff'];
        User::factory(5)->create([
            'password' => Hash::make('password123')
        ])->each(function($user, $index) use($roles) {
            $role = collect($roles)->get($index, 'kitchen_staff'); 
            $user->assignRole($role);
        });
    }
}
