import Layout from '@/Layouts/Layout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardX, Plus } from 'lucide-react';
import moment from 'moment';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';

type WasteLogRow = {
    id: number;
    waste_date: string;
    quantity: number | string;
    reason: string;
    cost_loss: number | string;
    notes?: string;
    branch?: { name: string };
    ingredient_batch?: {
        batch_number: string;
        ingredient?: { name: string; unit: string };
    };
};

type WasteLogIndexProps = {
    waste_logs: WasteLogRow[] | { data: WasteLogRow[] };
    filters?: { start_date?: string; end_date?: string };
};

export default function Index({ waste_logs, auth }: PageProps<WasteLogIndexProps>) {
    const logs = Array.isArray(waste_logs) ? waste_logs : waste_logs.data;
    const user = auth.user
    const createWasteLog = user.can?.['createWasteLog'] ?? false

    return (
        <Layout>
            <Head title="Waste Logs" />
            <div className="mx-auto max-w-6xl space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-medium text-red-600">Inventory control</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Waste logs</h1>
                        <p className="mt-1 text-sm text-slate-500">Review stock that was damaged, expired, spilled, or no longer usable.</p>
                    </div>
                    {createWasteLog && (
                        <Link href={route('waste-logs.create')}>
                            <Button type="button">
                                <Plus size={16} className="mr-2" /> Record waste
                            </Button>
                        </Link>
                    )}
                </div>

                {logs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <ClipboardX className="mx-auto h-9 w-9 text-slate-400" />
                        <p className="mt-3 font-medium text-slate-700">No waste records yet</p>
                        <p className="mt-1 text-sm text-slate-500">Create a record when stock can no longer be used.</p>
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
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Reason</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Cost loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{moment(log.waste_date).format('MMM, D YYYY')}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900">
                                                    {log.ingredient_batch?.ingredient?.name ?? 'Ingredient'}
                                                </p>
                                                <p className="text-xs text-slate-500">Batch {log.ingredient_batch?.batch_number ?? '-'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{+log.quantity} {log.ingredient_batch?.ingredient?.unit ?? ''}</td>
                                            <td className="px-4 py-3 text-slate-600">{log.reason}</td>
                                            <td className="px-4 py-3 text-slate-600">{(+log.cost_loss).toLocaleString('id-ID', {style:'currency', currency:'IDR'})}</td>
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