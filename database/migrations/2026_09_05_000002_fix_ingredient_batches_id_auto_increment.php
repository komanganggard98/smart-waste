<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            'ALTER TABLE `waste_logs` DROP FOREIGN KEY `waste_logs_ingredient_batch_id_foreign`'
        );

        DB::statement(
            'ALTER TABLE `waste_logs` MODIFY `ingredient_batch_id` BIGINT UNSIGNED NOT NULL'
        );

        DB::statement(
            'ALTER TABLE `ingredient_batches` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT'
        );

        DB::statement(
            'ALTER TABLE `waste_logs` ADD CONSTRAINT `waste_logs_ingredient_batch_id_foreign` '
            . 'FOREIGN KEY (`ingredient_batch_id`) REFERENCES `ingredient_batches` (`id`) ON DELETE CASCADE'
        );
    }

    public function down(): void
    {
        DB::statement(
            'ALTER TABLE `waste_logs` DROP FOREIGN KEY `waste_logs_ingredient_batch_id_foreign`'
        );

        DB::statement(
            'ALTER TABLE `ingredient_batches` MODIFY `id` CHAR(36) NOT NULL'
        );

        DB::statement(
            'ALTER TABLE `waste_logs` MODIFY `ingredient_batch_id` CHAR(36) NOT NULL'
        );

        DB::statement(
            'ALTER TABLE `waste_logs` ADD CONSTRAINT `waste_logs_ingredient_batch_id_foreign` '
            . 'FOREIGN KEY (`ingredient_batch_id`) REFERENCES `ingredient_batches` (`id`) ON DELETE CASCADE'
        );
    }
};
