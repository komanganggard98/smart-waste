import { FormIngredientBatchState } from '@/types';
import axios from 'axios';

export const fetchAvailableBatchApi = async (branchId?:number) => {
    // Karena menggunakan Laravel Ziggy, fungsi route() tetap bisa dipanggil di sini
    const response = await axios.get(route('ingredient-batches.available', { branch_id: branchId }));
    return response.data.data;
};

export const storeBatchApi = async (formData: FormIngredientBatchState) => {
    const response = await axios.post(
        route('ingredient-batches.store'),
        formData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        },
    );
    return response.data.data;
}