<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => 'owner']);
        Role::create(['name' => 'branch_manager']);
        Role::create(['name' => 'head_chef']);
        Role::create(['name' => 'kitchen_staff']);

        // Model Owner Branch Manager Head Chef Kitchen Staff Logika Otorisasi Utama
        // User	✅ Full	🟡 Cabang Sendiri	❌ Denied	❌ Denied	Owner kelola semua user. Manager hanya kelola staff cabangnya.
        // Branch	✅ Full	👁️ Read Only	👁️ Read Only	👁️ Read Only	Hanya Owner yang bisa menambah/mengubah master data cabang
        // Ingredient	✅ Full	🟡 Cabang Sendiri	🟡 Cabang Sendiri	👁️ Read Only	Master bahan baku cabang bisa diisi oleh Manager & Head Chef.
        // IngredientBatch	✅ Full	🟡 Cabang Sendiri	🟡 Cabang Sendiri	🟡 Cabang Sendiri	Pendaftaran stok masuk & update sisa batch untuk operasional dapur
        // WasteLog	✅ Full	🟡 Cabang Sendiri	🟡 Cabang Sendiri	➕ Create & View	Kitchen staff hanya bisa mencatat waste & melihat log cabangnya
    }
}
