<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};
use App\Traits\{BatchAutoFillTrait, CustomCascadeSoftDeletes};


class IngredientBatch extends Model
{
    use SoftDeletes, BatchAutoFillTrait, CustomCascadeSoftDeletes;
    
    protected $fillable = [
        'ingredient_id',
        'batch_number', // Kode unik dari pabrik atau pemasok untuk melacak kelompok produksi tertentu jika terjadi kerusakan atau penarikan produk
        'purchase_date', // Tanggal saat bahan baku tersebut dibeli dan masuk ke dalam gudang inventaris.
        'expiration_date', // Batas tanggal aman penggunaan bahan baku agar tidak mengolah bahan yang sudah rusak atau kedaluwarsa.
        'purchase_unit',
        'purchase_quantity',
        'units_per_purchase',
        'purchase_total_cost',
        'quantity_received', // Jumlah awal total bahan baku yang diterima saat pertama kali pembelian dilakukan dalam satuan tertentu. 50.00 (misalnya 50 kilogram)
        'quantity_remaining', // Sisa jumlah bahan baku saat ini yang masih ada di dalam stok dan siap untuk dipakai produksi 12.50 (sisa 12.5 kilogram)
        'unit_cost' // Harga beli per satu satuan unit bahan baku untuk menghitung total nilai aset stok dan harga HPP (Harga Pokok Penjualan) 12500.00 (Rp12.500 per kg)
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiration_date' => 'date',
        'purchase_quantity' => 'decimal:6',
        'units_per_purchase' => 'decimal:6',
        'purchase_total_cost' => 'decimal:2',
        'quantity_received' => 'decimal:6',
        'quantity_remaining' => 'decimal:6',
        'unit_cost' => 'decimal:6',
    ];

    public function ingredient(){
        return $this->belongsTo(Ingredient::class);
    }

    public function wasteLog(){
        return $this->belongsTo(WasteLog::class);
    }
}
