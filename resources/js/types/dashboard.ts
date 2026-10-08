import type { IngredientState } from './ingredient';

export interface IngredientMovementState{
  reference_id:number,
  ingredient_id:number,
  ingredient_name:string,
  type:'outgoing' | 'incoming',
  batch_number:number,
  quantity:number,
  date:string,
  description:string,
  unit:string,
}

export interface MetricsState{
    totalIngredients:{total:number, ingredients:IngredientState[]},
    expiringIngredients:{total:number, ingredients:IngredientState[]},
    lowStockIngredients:{total:number, ingredients:IngredientState[]},
    allMovements:IngredientMovementState[]
    branchPerformance?:any[],
    totalWasteCost?:any[]
}

export interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

export interface NearExpiryItem {
  id: number;
  ingredient_name: string;
  batch_number: string;
  expiration_date: string;
  remaining_quantity: number;
  unit: string;
}

export interface RecentActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "stock" | "waste" | "batch" | "alert";
}

export interface DashboardMetrics {
  totalIngredients: {
    total: number;
    ingredients: string[];
  };
  lowStockIngredients: {
    total: number;
    ingredients: string[];
    items?: LowStockItem[];
  };
  expiringIngredients: {
    total: number;
    ingredients: string[];
    items?: NearExpiryItem[];
  };
  recentActivities?: RecentActivityItem[];
  totalStock?: number;
  totalWasteToday?: number;
}