import Layout from '@/Layouts/Layout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardX, Plus, ReceiptText } from 'lucide-react';
import moment from 'moment';
import { Button } from '@/Components/ui/button';
import { IngredientBatchState, IngredientState, PageProps } from '@/types';

type StockConsumptionRow = {
    id: number;
    quantity: number | string;
    purpose: string;
    consumption_date: number | string;
    notes?: string;
    branch?: { name: string };
    user?: { name: string };
    ingredient_batch:IngredientBatchState ;
};

type StockConsumptionIndexProps = {
    stock_consumptions: StockConsumptionRow[] | { data: StockConsumptionRow[] };
    filters?: { start_date?: string; end_date?: string };
};

export default function Index({ stock_consumptions, auth }: PageProps<StockConsumptionIndexProps>) {
    const stocks = Array.isArray(stock_consumptions) ? stock_consumptions : stock_consumptions.data;
    const user = auth.user
    const createStockConsumption = user.can?.['createStockConsumption'] ?? false
    return (
        <Layout>
            <Head title="Waste Logs" />
            <div className="mx-auto max-w-6xl space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-medium text-red-600">Inventory Management</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900 inline-flex gap-1 items-center">
                            <ReceiptText /> Stock Usages
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">Track and monitor ingredients consumed for operations, events, and daily prep.</p>
                    </div>
                    {createStockConsumption && (
                        <Link href={route('stock-consumptions.create')}>
                            <Button type="button">
                                <Plus size={16} className="mr-2" /> Record usage
                            </Button>
                        </Link>
                    )}
                </div>

                {stocks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <ClipboardX className="mx-auto h-9 w-9 text-slate-400" />
                        <p className="mt-3 font-medium text-slate-700">No stock usage records yet</p>
                        <p className="mt-1 text-sm text-slate-500">Create a record whenever inventory is used or consumed.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Ingredient</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Quantity</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Purpose</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Branch</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Created By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {stocks.map((stock) => (
                                        <tr key={stock.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{moment(stock.consumption_date).format('MMM, D YYYY')}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900">
                                                    {stock.ingredient_batch?.ingredient?.name ?? 'Ingredient'}
                                                </p>
                                                <p className="text-xs text-slate-500">Batch {stock.ingredient_batch?.batch_number ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{+stock.quantity} {stock.ingredient_batch?.ingredient?.unit ?? ''}</td>
                                            <td className="px-4 py-3 text-slate-600">{stock.purpose}</td>
                                            <td className="px-4 py-3 text-slate-600">{stock.branch?.name ?? '-'}</td>
                                            <td className="px-4 py-3 text-slate-600">{stock.user?.name ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}