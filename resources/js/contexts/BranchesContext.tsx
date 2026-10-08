import { BranchState } from "@/types";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from "react";
import { fetchBranchesApi } from '@/services/branchService';

type BranchesContextType = {
    branches: BranchState[];
    loadingBranches: boolean;
    errorBranches: string | null;
    setBranches: Dispatch<SetStateAction<BranchState[]>>
    fetchBranches: (forceRefresh?: boolean) => Promise<void>;
    addBranch: (branch:BranchState) => void;
    removeBranch: (branchId:number) =>  void;
}

const BranchesContext = createContext<BranchesContextType>({ 
    branches:[], 
    loadingBranches:false, 
    errorBranches:null, 
    setBranches:(() => {}), 
    fetchBranches: async () => {}, 
    addBranch:(() => {}), 
    removeBranch:(() => {}) 
});

export function BranchesProvider({ children }:PropsWithChildren) {
    const [branches, setBranches] = useState<BranchState[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasFetched, setHasFetched] = useState<boolean>(false); // Penanda apakah sudah pernah fetch
    const [error, setError] = useState<string | null>(null);


    // Fungsi fetch: Hanya jalan jika belum pernah fetch sebelumnya
    const fetchBranches = async (forceRefresh = true): Promise<void> => {
        if (hasFetched && !forceRefresh) return; // KUNCI UTAMA: mencegah fetch ulang

        setLoading(true);
        setError(null)

        try {
            const data = await fetchBranchesApi();
            setBranches(data);
            setHasFetched(true);
        } catch (error) {
            console.error("Gagal memuat cabang global:", error);
            setError('Failed to fetch branches')
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menyisipkan cabang baru ke state global secara instan
    const addBranch = (newBranch:BranchState) => {
        setBranches((prev:BranchState[]) => [...prev, newBranch]);
    };

    const removeBranch = (branchId:number) => {
        setBranches((prev:BranchState[]) => prev.filter((branch:BranchState) => branch.id !== branchId))
    }

    return (
        <BranchesContext.Provider 
        value={{ 
            branches, 
            loadingBranches:loading, 
            errorBranches:error, 
            setBranches, 
            fetchBranches, 
            addBranch, 
            removeBranch 
        }}
        >
            {children}
        </BranchesContext.Provider>
    );
}

// Custom hook agar panggilnya lebih pendek di komponen
export const useBranchContext = () => useContext(BranchesContext);