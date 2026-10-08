import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { DashboardMetrics } from "@/types/dashboard";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  PackageCheck,
  Plus,
  TrendingUp,
  Warehouse,
} from "lucide-react";

type DashboardOverviewProps = {
  metrics: DashboardMetrics;
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const toneClass = {
    default: "bg-slate-50 text-slate-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    success: "bg-emerald-50 text-emerald-700",
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertList({
  title,
  items,
  emptyText,
  accent,
}: {
  title: string;
  items: any[];
  emptyText: string;
  accent: "warning" | "danger" | "success";
}) {
  const accentClass = {
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${accentClass[accent]}`}
          >
            {items.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          items.slice(0, 4).map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {item.name ?? item.ingredient_name ?? item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {item.batch_number ?? item.description ?? `${item.current_stock} / ${item.minimum_stock} ${item.unit ?? ""}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {item.current_stock ?? item.remaining_quantity ?? item.time}
                </p>
                <p className="text-[10px] text-slate-500">
                  {item.unit ?? item.expiration_date ?? "Now"}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityList({
  items,
}: {
  items?: Array<{ id: number; title: string; description: string; time: string; type: string }>;
}) {
  const data = items ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 px-2">
            <ArrowUpRight className="h-3.5 w-3.5" />
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            Belum ada aktivitas terbaru.
          </div>
        ) : (
          data.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-md ${
                  item.type === "waste"
                    ? "bg-red-50 text-red-600"
                    : item.type === "batch"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-sky-50 text-sky-600"
                }`}
              >
                {item.type === "waste" ? <AlertTriangle className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>

              <span className="text-[11px] text-slate-400">{item.time}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview({ metrics }: DashboardOverviewProps) {
  const lowStockItems = metrics.lowStockIngredients.items ?? [];
  const nearExpiryItems = metrics.expiringIngredients.items ?? [];
  const recentActivities = metrics.recentActivities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Ringkasan stok, alert, dan aktivitas inventaris</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Filter
          </Button>
          <Button type="button" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Ingredient"
          value={metrics.totalIngredients.total}
          subtitle={metrics.totalIngredients.ingredients.slice(0, 2).join(", ") || "Belum ada data"}
          icon={Boxes}
          tone="success"
        />
        <StatCard
          title="Low Stock"
          value={metrics.lowStockIngredients.total}
          subtitle="Butuh restock"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          title="Near Expiry"
          value={metrics.expiringIngredients.total}
          subtitle="Batch akan segera kadaluarsa"
          icon={CalendarClock}
          tone="danger"
        />
        <StatCard
          title="Total Stok"
          value={metrics.totalStock ?? 0}
          subtitle="Keseluruhan unit aktif"
          icon={Warehouse}
          tone="default"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AlertList
            title="Ingredient Low Stock"
            items={lowStockItems}
            emptyText="Tidak ada ingredient yang low stock."
            accent="warning"
          />
        </div>

        <AlertList
          title="Near Expiry"
          items={nearExpiryItems}
          emptyText="Tidak ada batch yang dekat expired."
          accent="danger"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Trend Stok</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-40 items-end gap-2 rounded-xl bg-slate-50 p-3">
              {[28, 40, 35, 52, 68, 60, 78].map((height, idx) => (
                <div key={idx} className="flex-1">
                  <div
                    className={`w-full rounded-t-md ${idx % 2 === 0 ? "bg-emerald-500" : "bg-sky-500"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>

        <RecentActivityList items={recentActivities} />
      </div>
    </div>
  );
}