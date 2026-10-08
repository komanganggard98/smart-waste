import type { BranchState } from './branch';

export interface StockConsumptionTemplateState {
    id: number;
    branch_id: number;
    name: string;
    purpose: string;
    notes?: string;
    is_active: boolean;
    items?: StockConsumptionTemplateItemState[];
    branch?: BranchState;
}

export interface StockConsumptionTemplateItemState {
    stock_consumption_template_id: number;
    ingredient_id: number;
    default_quantity: number;
}