import type { BranchState } from './branch';
import type { FormIngredientBatchState, IngredientBatchState } from './ingredient-batch';
import type { UserState } from './user';

export interface IngredientState {
    id: number;
    uuid: string;
    branch_id: number;
    code: string;
    name: string;
    unit: string;
    minimum_stock: number | '';
    expiry_alert_days: number | '';
    ingredient_batches?: IngredientBatchState[];
    branch?: BranchState;
}

export interface FormIngredientState {
    id?: string | number;
    branch_id?: string | number;
    code: string;
    name: string;
    unit: string;
    minimum_stock: number | '';
    expiry_alert_days: number | '';
    with_batch?: boolean;
    batch?: FormIngredientBatchState;
}

export interface IngredientFormProps {
    user?: UserState;
    branches: BranchState[];
    onSubmit: (ingredient: IngredientState) => void;
    branchId?: number;
    ingredientId?: number;
    onCancel?: () => void;
    submitLabel?: string;
}

export interface BranchForIngredientProps {
    branches: BranchState[];
    selectedBranch?: number;
    onAddBranch: (branch: BranchState) => void;
    onSelectBranch?: (branch: BranchState) => void;
    nextHandler: () => void;
}

export interface IngredientFormDetailProps {
    data: FormIngredientState;
    branches: BranchState[];
    batchData: FormIngredientBatchState;
}