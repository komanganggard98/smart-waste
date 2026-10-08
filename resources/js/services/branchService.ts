import { FormBranchState } from '@/types';
import axios from 'axios';

export const fetchBranchesApi = async () => {
    // Karena menggunakan Laravel Ziggy, fungsi route() tetap bisa dipanggil di sini
    const response = await axios.get(route('branches.list'));
    return response.data.data;
};

export const storeBranchApi = async (formData: FormBranchState) => {
    const response = await axios.post(
        route('branches.store'),
        formData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        },
    );
    return response.data.data;
}

export const updateBranchApi = async (formData: FormBranchState, uuid:string) => {
    const response = await axios.put(
        route('branches.update', uuid),
        formData,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        },
    );
    return response.data.data;
}
