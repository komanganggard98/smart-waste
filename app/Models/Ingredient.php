<?php

namespace App\Models;

use App\Traits\{HasCustomUuid, CustomCascadeSoftDeletes};
use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class Ingredient extends Model
{
    use SoftDeletes, HasCustomUuid, CustomCascadeSoftDeletes;
    
    protected $fillable = [
        'branch_id',
        'code', // Kode unik/SKU (Stock Keeping Unit) untuk mengidentifikasi bahan baku secara cepat, memudahkan pencarian, pencetakan label, atau pemindaian barcode. contoh: ING-MILK-001
        'name', // Nama umum/deskriptif dari bahan baku yang digunakan dalam resep atau operasional dapur. contoh : Susu UHT Full Cream 1L
        'unit', // Satuan pengukuran standar untuk menghitung jumlah/volume bahan baku (digunakan saat resep, penerimaan batch, maupun pencatatan waste). contoh: kg, liter, pcs, gram
        'minimum_stock', // Batas ambang batas (threshold) minimum stok. Jika akumulasi total stok dari seluruh batch aktif kurang dari angka ini, sistem otomatis memicu LOW_STOCK Alert. contoh: 5.00
        'expiry_alert_days' // Ambang batas waktu pemicu peringatan dini kadaluarsa (H-minus berapa hari sebelum expiration_date batch tercapai) untuk memicu NEAR_EXPIRY Alert. contoh: 7 (Artinya alert muncul 7 hari sebelum kadaluarsa)
    ];

    /**
     * Casts tipe data bawaan database ke tipe data PHP.
     */
    protected $casts = [
        'minimum_stock' => 'decimal:6',
        'expiry_alert_days' => 'integer',
    ];

    public function ingredientBatches(){
        return $this->hasMany(IngredientBatch::class);
    }

    public function branch(){
        return $this->belongsTo(Branch::class);
    }
}
