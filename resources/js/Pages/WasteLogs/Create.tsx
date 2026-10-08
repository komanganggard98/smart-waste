import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ConfirmWasteModal from '@/Components/ConfirmWasteModal';
import TextInput from '@/Components/TextInput';
import Layout from '@/Layouts/Layout';
import { IngredientBatchState, PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangleIcon, ArrowLeft, Save, Trash2, XIcon } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import moment from 'moment';
import SelectInput from '@/Components/SelectInput';
import { Button } from '@/Components/ui/button';
import { useAutoNumberInput } from '@/Hooks/useAutoNumberInput';

type WasteLogForm = {
    branch_id: number | '';
    ingredient_batch_id: number | '';
    waste_date: string;
    quantity: number | '';
    reason: string;
    notes: string;
};

type WasteLogCreateProps = {
    available_batches: Array<IngredientBatchState & {
        ingredient?: {
            id: number;
            name: string;
            unit: string;
            branch_id?: number;
            branch?: {
                id: number;
                name: string;
            };
        };
    }>;
    default_batch_id?: number | null;
    default_branch_id?: number | null;
};

const today = new Date().toISOString().slice(0, 10);

export default function Create({
    available_batches,
    default_batch_id,
    default_branch_id,
}: PageProps<WasteLogCreateProps>) {
    const [alertMessage, setAlertMessage] = useState<string | undefined>()
    const { data, setData, post, processing, errors } = useForm<WasteLogForm>({
        branch_id: default_branch_id ?? '',
        ingredient_batch_id: default_batch_id ?? '',
        waste_date: today,
        quantity: '',
        reason: '',
        notes: '',
    });
    const {handleInputChange} = useAutoNumberInput()
    const selectedBatch = available_batches.find(
        (batch) => +(batch.id) === +(data.ingredient_batch_id),
    );
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if(selectedBatch){
            setData({
                ...data, 
                branch_id:selectedBatch.ingredient?.branch_id ?? default_branch_id ?? '',
                reason: moment(selectedBatch.expiration_date).isSameOrBefore(moment()) ? 'Expired' : ''
            })
        }
    }, [selectedBatch?.id]);

    const handleBatchChange = (batchId: string) => {
        const batch = available_batches.find((item) => String(item.id) === batchId);
        setData((current) => ({
            ...current,
            ingredient_batch_id: batchId ? +(batchId) : '',
            branch_id: batch?.ingredient?.branch_id ?? default_branch_id ?? '',
        }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setShowConfirmation(true);
    };

    const confirmSubmit = () => {
        post(route('waste-logs.store'), {
            onFinish: () => setShowConfirmation(false),
            onError: (err:any) => setAlertMessage(err?.store_waste_log_error ?? 'Something wrong!')
        });
    };

    const handleNumberChange = (
        field: 'quantity',
        value: string,
    ) => {
        handleInputChange(value, String(data[field] ?? ''), (nextValue: string) => {
            setData(field, +(nextValue));
        });
    };

    return (
        <Layout>
            <Head title={`Record Waste`} />

            <div className={`mx-auto max-w-3xl`}>
                <div className={`mb-6 flex items-center justify-between gap-4`}>
                    <div>
                        <p className={`text-sm font-medium text-red-600`}>Inventory control</p>
                        <h1 className={`mt-1 text-2xl font-semibold text-slate-900`}>Record waste</h1>
                        <p className={`mt-1 text-sm text-slate-500`}>
                            Record unusable stock so the batch quantity and waste cost stay accurate.
                        </p>
                    </div>
                    <Button
                        variant={`outline`}
                        type={`button`}
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                </div>

                {alertMessage && (
                    <div className={`rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-900 flex items-start justify-between mb-3`}>
                        <div className={`flex items-start gap-3`}>
                            <AlertTriangleIcon className={`mt-0.5 shrink-0`} size={18} />
                            <p>{alertMessage}</p>
                        </div>
                        <button
                            type={`button`}
                            onClick={() => setAlertMessage(undefined)}
                        >
                            <XIcon size={15}/>
                        </button>
                    </div>
                )}

                <form onSubmit={submit} className={`space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
                    <div className={`rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900`}>
                        <div className={`flex items-start gap-3`}>
                            <Trash2 className={`mt-0.5 shrink-0`} size={18} />
                            <p>Only record stock that is damaged, expired, spilled, or otherwise not usable.</p>
                        </div>
                    </div>

                    <div className={`grid gap-5 sm:grid-cols-2`}>
                        <div className={`sm:col-span-2`}>
                            <InputLabel htmlFor={`ingredient_batch_id`} value={`Ingredient batch`} />
                            <SelectInput
                                id={`unit`}
                                value={data.ingredient_batch_id}
                                onChange={(event) => handleBatchChange(event.target.value)}
                                required
                            >
                                <option value={``}>Select a batch</option>
                                {available_batches.map((batch) => (
                                    <option key={`batch_${batch.id}`} value={batch.id}>
                                        {batch.ingredient?.name ?? 'Ingredient'} - {batch.batch_number} ({+batch.quantity_remaining} {batch.ingredient?.unit ?? 'unit'} available)
                                    </option>
                                ))}
                            </SelectInput>
                            {available_batches.length === 0 && (
                                <div className={`mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900`}>
                                    No available stock can be recorded as waste. Add stock to an ingredient batch first.
                                </div>
                            )}
                            <InputError message={errors.ingredient_batch_id} className={`mt-1`} />
                        </div>

                        <div>
                            <InputLabel value={`Branch`} />
                            <TextInput 
                                value={selectedBatch?.ingredient?.branch?.name ?? (data.branch_id ? `Branch #${data.branch_id}` : 'Selected from batch')} 
                                className={`mt-1 w-full bg-slate-50`} readOnly 
                            />
                            <p className={`mt-1 text-xs text-slate-500`}>Automatically filled from the selected batch.</p>
                            <InputError message={errors.branch_id} className={`mt-1`} />
                        </div>

                        <div>
                            <InputLabel htmlFor={`waste_date`} value={`Waste date`} />
                            <TextInput
                                id={`waste_date`}
                                type={`date`}
                                value={data.waste_date}
                                max={today}
                                onChange={(event) => setData('waste_date', event.target.value)}
                                className={`mt-1 w-full`}
                                required
                            />
                            <InputError message={errors.waste_date} className={`mt-1`} />
                        </div>

                        <div className={`sm:col-span-2`}>
                            <div className={`grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3`}>
                                <div>
                                    <p className={`text-xs text-slate-500`}>Batch expiry</p>
                                    <p className={`mt-1 font-medium text-slate-800`}>
                                        {selectedBatch?.expiration_date ? moment(selectedBatch?.expiration_date).format('MMM, D YYYY') : 'Select a batch'}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs text-slate-500`}>Available stock</p>
                                    <p className={`mt-1 font-medium text-slate-800`}>
                                        {selectedBatch ? `${+selectedBatch.quantity_remaining} ${selectedBatch.ingredient?.unit ?? ''}` : 'Select a batch'}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs text-slate-500`}>Unit cost</p>
                                    <p className={`mt-1 font-medium text-slate-800`}>
                                        {selectedBatch ? (+selectedBatch.unit_cost).toLocaleString(
                                        'id-ID', { style:'currency', currency:'IDR' }
                                    ) : 'Select a batch'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor={`quantity`} value={`Waste quantity${selectedBatch?.ingredient?.unit ? ` (${selectedBatch.ingredient.unit})` : ''}`} />
                            <TextInput
                                id={`quantity`}
                                type={`number`}
                                min={`0.01`}
                                max={selectedBatch?.quantity_remaining ?? 0}
                                step={`0.01`}
                                value={data.quantity.toString()}
                                onChange={(event) => {
                                    handleNumberChange('quantity', event.target.value)
                                }}
                                className={`w-full`}
                                required
                            />
                            <p className={`mt-1 text-xs ${+data.quantity > (selectedBatch?.quantity_remaining ?? 0)  ? 'text-red-500' : 'text-slate-500'}`}>
                                Record only unusable stock. Available: {selectedBatch ? `${+selectedBatch.quantity_remaining} ${selectedBatch.ingredient?.unit ?? ''}` : 'Select a batch first'}.
                            </p>
                            <InputError message={errors.quantity} className={`mt-1`} />
                        </div>

                        <div>
                            <InputLabel htmlFor={`reason`} value={`Reason`} />
                            <SelectInput
                                id={`reason`}
                                value={data.reason}
                                onChange={(event) => setData('reason', event.target.value)}
                                required
                            >
                                <option value={``}>Select a reason</option>
                                <option value={`Expired`}>Expired</option>
                                <option value={`Damaged`}>Damaged</option>
                                <option value={`Spilled`}>Spilled</option>
                                <option value={`Quality issue`}>Quality issue</option>
                                <option value={`Other`}>Other</option>
                            </SelectInput>
                            <InputError message={errors.reason} className={`mt-1`} />
                        </div>

                        <div className={`sm:col-span-2`}>
                            <InputLabel htmlFor={`notes`} value={`Notes (optional)`} />
                            <textarea
                                id={`notes`}
                                value={data.notes}
                                onChange={(event) => setData('notes', event.target.value)}
                                rows={4}
                                className={`mt-1 block w-full rounded-md border-slate-200 text-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary-soft)]`}
                                placeholder={`Add details that may help with review or audit`}
                            />
                            <InputError message={errors.notes} className={`mt-1`} />
                        </div>
                    </div>

                    {(selectedBatch && data.quantity !== '' && +(data.quantity) > 0) && (
                        <div className={`rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900`}>
                            Saving this record will reduce <strong>{selectedBatch.ingredient?.name}</strong> by <strong>{data.quantity}</strong> {selectedBatch.ingredient?.unit ?? ''} from batch <strong>{selectedBatch.batch_number}</strong>.
                        </div>
                    )}

                    <div className={`flex justify-end gap-3 border-t border-slate-100 pt-5`}>
                        <Button
                            variant={`ghost`}
                            type={`button`}
                            onClick={() => window.history.back()}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type={`submit`} disabled={processing || !selectedBatch}>
                            <Save size={16} className={`mr-2`} />
                            {processing ? 'Saving...' : 'Save waste record'}
                        </Button>
                    </div>
                </form>
            </div>
            {selectedBatch && (
                <ConfirmWasteModal
                    ingredientName={selectedBatch.ingredient?.name ?? 'Ingredient'}
                    batchNumber={selectedBatch.batch_number}
                    quantity={data.quantity}
                    unit={selectedBatch.ingredient?.unit ?? 'unit'}
                    reason={data.reason}
                    show={showConfirmation}
                    processing={processing}
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={confirmSubmit}
                />
            )}
        </Layout>
    );
}