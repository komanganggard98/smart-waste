import type { BranchState } from './branch';
import type { IngredientBatchState } from './ingredient-batch';

export type ConsumptionItem = {
    ingredient_batch_id: number | '';
    quantity: number | '';
    ingredient_id: number | '';
};

export type StockConsumptionForm = {
    branch_id: number | '';
    items: ConsumptionItem[];
    consumption_date: string;
    purpose: string;
    notes: string;
};

export type AvailableBatch = IngredientBatchState & {
    ingredient?: {
        id: number;
        name: string;
        unit: string;
        branch_id?: number;
        branch?: BranchState;
    };
};

export type ReceiptTemplateItem = {
    ingredient_id: number;
    default_quantity: number;
    ingredient?: {
        name: string;
        unit: string;
    };
};

export type ReceiptTemplate = {
    id: number;
    name: string;
    purpose: string;
    notes?: string | null;
    items: ReceiptTemplateItem[];
    branch_id: number;
};

export type StockConsumptionCreateProps = {
    available_batches: AvailableBatch[];
    templates: ReceiptTemplate[];
    default_batch_id?: number | null;
    default_branch_id?: number | null;
    branches: BranchState[];
};

export type IngredientOption = {
    id: number;
    name: string;
    unit: string;
};

export type ReceiptTemplateFormItem = {
    ingredient_id: number | '';
    default_quantity: number | '';
    id: number | null;
};

export type ReceiptTemplateForm = {
    name: string;
    purpose: string;
    notes: string;
    items: ReceiptTemplateFormItem[];
    branch_id: string | number;
};