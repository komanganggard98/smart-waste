import type { BranchState } from './branch';
import type { IngredientState } from './ingredient';

export interface IngredientBatchState {
    id: number;
    ingredient_id: number;
    batch_number: string;
    purchase_date: string;
    purchase_unit: string;
    purchase_quantity: string;
    units_per_purchase: string;
    purchase_total_cost: string;
    expiration_date: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost: number;
    ingredient?: IngredientState;
}

export interface FormIngredientBatchState {
    id?: string | number;
    ingredient_id?: number | string;
    batch_number: string;
    purchase_date: string;
    expiration_date: string;
    purchase_unit?: string;
    purchase_quantity?: string | number;
    units_per_purchase?: string | number;
    purchase_total_cost?: string | number;
    quantity_received: string | number;
    quantity_remaining: string | number;
    unit_cost: string | number;
}

export interface IngredientBatchFormProps {
    formData: FormIngredientBatchState;
    onChange: <K extends keyof FormIngredientBatchState>(
        field: K,
        value: FormIngredientBatchState[K],
    ) => void;
    clientErrors: Record<string, string>;
    ingredient?: IngredientState;
    ingredients?: IngredientState[];
    loadingIngredients?: boolean;
    branches?: BranchState[];
    handleBranchChange?: (value: string) => void;
    setShowAddIngredient?: (value: boolean) => void;
}