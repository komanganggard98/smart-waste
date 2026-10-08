import { FormIngredientState } from '@/types';
import axios from 'axios';

interface FetchIngredientsParams {
    branch_id?: number;
    name?: string;
    has_no_batch?: boolean;
}
export const fetchIngredientsApi = async ({
    branch_id,
    name,
    has_no_batch
}: FetchIngredientsParams) => {
    // Karena menggunakan Laravel Ziggy, fungsi route() tetap bisa dipanggil di sini
    const response = await axios.get(route('ingredients.list', { branch_id, name, has_no_batch }));
    return response.data.data;
};

export const checkIngredientCodeApi = async (
    code: string,
    branchId: string | number,
    ingredientId: null | number,
    signal?: AbortSignal,
) => {
    const response = await axios.get(route('ingredients.check-code'), {
        params: { code, branch_id: branchId, except_ingredient_id:ingredientId },
        signal,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    return response.data.available as boolean;
};

export const storeIngredientApi = async (formData: FormIngredientState) => {
    const response = await axios.post(
        route('ingredients.store'),
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

export const updateIngredientApi = async (uuid: string, formData: FormIngredientState) => {
    const response = await axios.put(
        route('ingredients.update', uuid),
        formData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        },
    );

    return response.data.data ?? response.data;
};
