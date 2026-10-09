import Layout from '@/Layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardX, Eye, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {  PageProps, StockConsumptionTemplateState } from '@/types';
import { useState } from 'react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import { ToggleSwitch } from 'flowbite-react';
import ConfirmActivateTemplateModal from '@/Components/ConfirmActivateTemplateModal';

type StockConsumptionTemplateIndexProps = {
    data: StockConsumptionTemplateState[] | { data: StockConsumptionTemplateState[] };
    filters?: { branch_id?:number, search?:string };
};

export default function Index({ data, auth }: PageProps<StockConsumptionTemplateIndexProps>) {
    const templates = Array.isArray(data) ? data : data.data;
    const user = auth.user
    const createStockConsumptionTemplate = user.can?.['createStockConsumptionTemplate'] ?? false
    const deleteStockConsumptionTemplate = user.can?.['deleteStockConsumptionTemplate'] ?? false
    const updateStockConsumptionTemplate = user.can?.['updateStockConsumptionTemplate'] ?? false

    const [deleteTarget, setDeleteTarget] = useState<StockConsumptionTemplateState | undefined>()
    const [deleting, setDeleting] = useState(false);
    const [activateTarget, setActivateTarget] = useState<StockConsumptionTemplateState | undefined>();
    const [activating, setActivating] = useState<boolean>(false);
    

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('stock-consumption-templates.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setDeleting(false),
        });
    };

    const handleActivation = () => {
        if (!activateTarget?.id) return;
        setDeleting(true);
        router.post(route('stock-consumption-templates.activate', activateTarget.id),{} ,{
            preserveScroll: true,
            preserveState: false, // Set false agar React memperbarui props komponen dengan data terbaru dari server
            onSuccess: () => setActivateTarget(undefined),
            onFinish: () => setActivating(false),
        });
    };
    return (
        <Layout>
            <Head title={`Stock Usage Templates`} />
            <div className={`mx-auto max-w-6xl space-y-5`}>
                <div className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-end`}>
                    <div>
                        <h1 className={`mt-1 text-2xl font-semibold text-slate-900 inline-flex gap-1 items-center`}>
                            <ReceiptText /> Stock Usage Templates
                        </h1>
                        <p className={`mt-1 text-sm text-slate-500`}>
                            Create reusable ingredient quantities for a recurring recipe or operating process. Each quantity uses the ingredient's standard unit.
                        </p>
                    </div>
                    {createStockConsumptionTemplate && (
                        <Link href={route('stock-consumption-templates.create')}>
                            <Button type={`button`}>
                                <Plus size={16} className={`mr-2`} /> Receipt Template
                            </Button>
                        </Link>
                    )}
                </div>

                {templates.length === 0 ? (
                    <div className={`rounded-lg border border-dashed border-slate-200 bg-slate-50 p-10 text-center`}>
                        <ClipboardX className={`mx-auto h-9 w-9 text-slate-400`} />
                        <p className={`mt-3 font-medium text-slate-700`}>No templates records yet</p>
                        <p className={`mt-1 text-sm text-slate-500`}>Create reusable ingredient quantities for a recurring recipe or operating process. Each quantity uses the ingredient's standard unit.</p>
                    </div>
                ) : (
                    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm`}>
                        <div className={`overflow-x-auto`}>
                            <table className={`min-w-full divide-y divide-slate-200 text-sm`}>
                                <thead className={`bg-slate-50`}>
                                    <tr>
                                        <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Template</th>
                                        <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Purpose</th>
                                        <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Is Active</th>
                                        <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Notes</th>
                                        {(deleteStockConsumptionTemplate || updateStockConsumptionTemplate) && (
                                            <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-slate-200`}>
                                    {templates.map((template) => (
                                        <tr key={template.id} className={`hover:bg-slate-50`}>
                                            <td className={`px-4 py-3`}>
                                                <p className={`font-medium text-slate-900`}>
                                                    {template.name ?? 'Ingredient'}
                                                </p>
                                                <p className={`text-xs text-slate-500`}>{template.branch?.name ?? ''}</p>
                                            </td>
                                            <td className={`px-4 py-3 text-slate-600`}>{template.purpose}</td>
                                            <td className={`px-4 py-3 text-slate-600`}>
                                                <ToggleSwitch 
                                                    checked={template.is_active} 
                                                    onChange={() => setActivateTarget(template)} 
                                                    color={`green`}
                                                />
                                            </td>
                                            <td className={`px-4 py-3 text-slate-600`}>{template.notes ?? '-'}</td>
                                            {(deleteStockConsumptionTemplate || updateStockConsumptionTemplate) && (
                                                <td className={`px-4 py-3 text-slate-600`}>
                                                    <div className={`flex justify-end gap-2`}>
                                                        {updateStockConsumptionTemplate && (
                                                            <Link href={route('stock-consumption-templates.edit', template.id)}>
                                                                <Button type={`button`} variant={`outline`} size={`sm`}>
                                                                    <Eye className={`mr-1 h-4 w-4`} /> View
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {deleteStockConsumptionTemplate && (
                                                            <Button
                                                                type={`button`}
                                                                variant={`destructive`}
                                                                size={`sm`}
                                                                aria-label={`Delete ${template.name}`}
                                                                onClick={() => setDeleteTarget(template)}
                                                            >
                                                                <Trash2 className={`mr-1 h-4 w-4`} /> Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {deleteTarget && (
                <ConfirmDeleteModal
                    name={deleteTarget.name}
                    show
                    processing={deleting}
                    onCancel={() => setDeleteTarget(undefined)}
                    onConfirm={handleDelete}
                    type={`template`}
                />
            )}
            {activateTarget && (
                <ConfirmActivateTemplateModal
                    template={activateTarget}
                    show
                    processing={activating}
                    onCancel={() => setActivateTarget(undefined)}
                    onConfirm={handleActivation}
                />
            )}
        </Layout>
    );
}