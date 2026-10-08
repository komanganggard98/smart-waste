import Layout from '@/Layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { IngredientState, PageProps } from '@/types';
import { ArrowLeft, Package, CalendarClock, Box, Plus, Pencil } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import moment from 'moment';
import { useState } from 'react';
import AddBatchModal from '@/Components/ingredient/AddBatchModal';
import EditIngredientModal from '@/Components/ingredient/EditIngredientModal';

export default function Show({ data }: PageProps<{ data: IngredientState }>) {
    const batches = data.ingredient_batches ?? [];
    const totalCurrentStock = batches.reduce((sum, batch) => sum + Number(batch.quantity_remaining ?? 0), 0);

    const [showAddBatch, setShowAddBatch] = useState<boolean>(false)
    const [showEditIngredient, setShowEditIngredient] = useState<boolean>(false)
    return (
        <Layout>
            <Head title={`${data.name} - Stock Detail`} />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className={`flex items-center gap-2`}>
                            <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1> 
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowEditIngredient(true)}>
                                <Pencil />
                            </Button>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{data.code}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Package className="h-4 w-4" />
                            <span className="text-sm">Current stock</span>
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {totalCurrentStock} <span className="text-base font-medium text-slate-500">{data.unit}</span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Box className="h-4 w-4" />
                            <span className="text-sm">Minimum stock</span>
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {Number(data.minimum_stock ?? 0)} <span className="text-base font-medium text-slate-500">{data.unit}</span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                            <CalendarClock className="h-4 w-4" />
                            <span className="text-sm">Expiry alert</span>
                        </div>
                        <p className={`mt-3 text-2xl font-semibold text-slate-900`}>
                            {Number(data.expiry_alert_days ?? 0)} <span className="text-base font-medium text-slate-500">days</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Batches</h2>
                    <Button type="button" className="gap-2" onClick={() => setShowAddBatch(true)}>
                        <Plus className="h-4 w-4" />
                        Add batch
                    </Button>
                </div>

                {batches.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        No batch has been recorded for this ingredient yet.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Batch</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Purchase</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Expiry</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Received</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Remaining</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Unit cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {batches.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{batch.batch_number}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {batch.purchase_date ? moment(batch.purchase_date).format('DD MMM YYYY') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {batch.expiration_date ? moment(batch.expiration_date).format('DD MMM YYYY') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {+(batch.quantity_received ?? 0)} {data.unit}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {+(batch.quantity_remaining ?? 0)} {data.unit}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {+(batch.unit_cost ?? 0).toLocaleString('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    maximumFractionDigits: 0,
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showAddBatch && (
                    <AddBatchModal
                        ingredient={data}
                        onSubmit={() => {
                            setShowAddBatch(false)
                            router.reload({
                                only:['data']
                            })
                        }}
                        closeHandler={() => setShowAddBatch(false)}
                    />
                )}

                {showEditIngredient && (
                    <EditIngredientModal
                        ingredient={data}
                        closeHandler={() => setShowEditIngredient(false)}
                        onSubmit={() => {
                            setShowEditIngredient(false);
                            router.reload({ only: ['data'] });
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}
