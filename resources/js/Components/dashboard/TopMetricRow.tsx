import { AlertCircle, Boxes, CalendarX, Check, DollarSign, Minus, Plus, Search, Warehouse } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MetricsState } from "@/types/dashboard";
import { fetchIngredientsApi } from "@/services/ingredientService";
import MetricCard from "./MetricCard";
import { IngredientState } from "@/types";

export default function TopMetricRow({ metrics }: { metrics: MetricsState }) {
    const [stockCount, setStockCount] = useState(42);
    const [ingredients, setIngredients] = useState<any[]>([])
    
    const handleSearch = async (name:string) => {
      // setTimeout
      const response = await fetchIngredientsApi({branch_id:undefined, name, has_no_batch:false})
    }

    const LowStockList = metrics
    .lowStockIngredients
    .ingredients
    .slice(0,3)
    .map((item:IngredientState) => item.name)
    .join(', ')

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Ingredients */}
          <MetricCard 
            title="Total Ingredients"
            icon={Boxes}
            subtitle={metrics.totalIngredients.total.toString()}
            value={LowStockList}
            tone="success"
          />

          {/* Low Stock Alerts */}
          <MetricCard 
            title="Low Stock Alerts"
            icon={AlertCircle}
            subtitle={metrics.lowStockIngredients.total.toString()}
            value={`Restock required`}
            tone="warning"
          />

          {/* Expiring Alert */}
          <MetricCard 
            title="Expiring Alert"
            icon={CalendarX}
            subtitle={metrics.expiringIngredients.total.toString()}
            value={`The batch is about to expire`}
            tone="danger"
          />

          {/* Total Active Stock */}
          <MetricCard 
            title="Total Stock"
            icon={Warehouse}
            subtitle={metrics.expiringIngredients.total.toString()}
            value={`Entire active unit`}
          />
        </div>
    )
}