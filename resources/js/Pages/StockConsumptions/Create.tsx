import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Layout from '@/Layouts/Layout';
import { fetchAvailableBatchApi } from '@/services/batchService';
import { BranchState, IngredientState, PageProps, RoleState, UserState } from '@/types';
import {
    AvailableBatch,
    ConsumptionItem,
    StockConsumptionCreateProps,
    StockConsumptionForm,
} from '@/types/stock-consumption';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardPenLine, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { BranchesProvider, useBranchContext } from '@/contexts/BranchesContext';
import BranchFormModal from '@/Components/branch/BranchFormModal';
import AddBatchModal from '@/Components/ingredient/AddBatchModal';
import AddIngredientModal from '@/Components/ingredient/AddIngredientModal';
import { fetchIngredientsApi } from '@/services/ingredientService';
import Loading from '@/Components/Loading';
import { focusValidationField } from '@/lib/utils';
import SelectInput from '@/Components/SelectInput';
import { PURPOSE_OPTIONS } from '@/lib/constant';
import { Button } from '@/Components/ui/button';
import NoIngredientsFound from '@/Components/ingredient/NoIngredientsFound';
import NoBranchesFound from '@/Components/ingredient/NoBranchesFound';
import Alert from '@/Components/Alert';


const today = new Date().toISOString().slice(0, 10);
const Item:ConsumptionItem[] = [{ ingredient_batch_id: '', quantity: '', ingredient_id: '' }]

export default function Create({ auth, available_batches, templates, default_batch_id, default_branch_id, branches }: PageProps<StockConsumptionCreateProps>) {
    return (
        <Layout>
            <Head title="Record Stock Usage" />
            <BranchesProvider>
                <CreateContent 
                    auth={auth} 
                    available_batches={available_batches}
                    templates={templates} 
                    default_batch_id={default_batch_id}
                    default_branch_id={default_branch_id} 
                    branches={branches}
                />
            </BranchesProvider>
        </Layout>
    );
}

function CreateContent({ auth, available_batches, templates, default_batch_id, default_branch_id, branches }: PageProps<StockConsumptionCreateProps>) {
    const roles =  auth.user.roles
    const isOwner = roles.map((role:RoleState) => role.name).includes('owner')

    const { branches:branchesList, setBranches, loadingBranches } = useBranchContext();

    const [fetchingAvailbleBatches, setFetchingAvailbleBatches] = useState<boolean>(false)
    const [availableBatches, setAvailableBatches] = useState<AvailableBatch[]>(available_batches) 
    const [ingredientHasNoBatch, setIngredientHasNoBatch] = useState<IngredientState[]>([])
    const [branchIngredientCount, setBranchIngredientCount] = useState<number | null>(null)
    const [selectedIngredient, setSelectedIngredient] = useState<IngredientState | null>(null)
    const [loadingIngredients, setLoadingIngredients] = useState(false)
    const [showAddBranch, setShowAddBranch] = useState<boolean>(false)
    const [showAddIngredient, setShowAddIngredient] = useState(false)
    const [otherPurpose, setOtherPurpose] = useState<string>('')
    const { data, setData, post, processing, errors } = useForm<StockConsumptionForm>({
        branch_id: default_branch_id ?? '',
        items: [{ ingredient_batch_id: default_batch_id ?? '', quantity: '', ingredient_id:'' }],
        consumption_date: today,
        purpose: '',
        notes: '',
    });

    useEffect(() => {
        setBranches(branches)
    }, [branches, setBranches])

    const loadBranchIngredients = async (branchId: number, batches: AvailableBatch[]) => {
        setLoadingIngredients(true)
        try {
            const branchIngredients = await fetchIngredientsApi({branch_id:branchId, has_no_batch:true})
            setBranchIngredientCount(branchIngredients.length)
            setIngredientHasNoBatch(branchIngredients)
        } catch {
            setBranchIngredientCount(null)
            setIngredientHasNoBatch([])
        } finally {
            setLoadingIngredients(false)
        }
    }

    useEffect(() => {
        if (!data.branch_id || branchIngredientCount !== null) return
        loadBranchIngredients(Number(data.branch_id), availableBatches)
    }, [data.branch_id, availableBatches, branchIngredientCount])

    const updateItem = (index: number, field: keyof ConsumptionItem, value: number | '') => {
        setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    };
    
    const selectedBatch = (item: ConsumptionItem) => {
        return availableBatches.find((batch) => Number(batch.id) === Number(item.ingredient_batch_id))
    };

    const addItem = () => {
        setData('items', [...data.items, { ingredient_batch_id: '', quantity: '', ingredient_id: '' }])
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, itemIndex) => itemIndex !== index))
    };

    const handleBatchChange = (index: number, batchId: string) => {
        const batch = availableBatches.find((item) => String(item.id) === batchId);
        updateItem(index, 'ingredient_batch_id', batchId ? Number(batchId) : '');
    };

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find((item) => String(item.id) === templateId);
        if (!template) {
            setData({
                ...data,
                items: Item,
                purpose: '',
                notes: ''
            })
            return;
        }
        const items: ConsumptionItem[] = template.items.map((templateItem) => {
            const batch = availableBatches.find((item) => item.ingredient_id === templateItem.ingredient_id);
            return { ingredient_batch_id: batch ? Number(batch.id) : '', quantity: templateItem.default_quantity, ingredient_id:templateItem.ingredient_id };
        });

        setData((current) => {
            const purpose = PURPOSE_OPTIONS.find((p:string) => p.toLowerCase() === template.purpose.toLowerCase())

            if(!purpose){
                setOtherPurpose(template.purpose)
            }
            return { ...current, 
                branch_id: template.branch_id, 
                items, 
                purpose: purpose ? template.purpose : 'Other', 
                notes: template.notes ?? '' 
            }
        });
    };

    const submit = (event: FormEvent) => { 
        event.preventDefault(); 
        post(route('stock-consumptions.store'), {
            onError:(error:Record<string, string>) => {
                const errorKeys = Object.keys(error)
                if(errorKeys.length > 0){
                    focusValidationField(errorKeys[0])
                }
            }
        }); 
    };

    const branch = selectedBatch(data.items[0])?.ingredient?.branch?.name;
    
    const getAvailableBatch = async (branchId:number) => {
        setFetchingAvailbleBatches(true)
        try {
            return await fetchAvailableBatchApi(branchId)
        } finally {
            setFetchingAvailbleBatches(false)
        }
    }
    
    const handleBranchChange = async (branchId:number | '') => {
        if(fetchingAvailbleBatches) return

        setAvailableBatches([])
        setIngredientHasNoBatch([])
        setBranchIngredientCount(null)
        setData({
            ...data,
            branch_id:branchId,
            items: Item,
        })

        if(branchId !== ''){
            setLoadingIngredients(true)
            try {
                const [batches, branchIngredients] = await Promise.all([getAvailableBatch(branchId), fetchIngredientsApi({branch_id:branchId, has_no_batch:true})])
                setAvailableBatches(batches)
                setBranchIngredientCount(branchIngredients.length)
                setIngredientHasNoBatch(branchIngredients)
            } finally {
                setLoadingIngredients(false)
            }
        }
    }

    const handleBatchCreated = (batch: AvailableBatch) => {
        setAvailableBatches((current) => [...current, batch])
        const findBatchInItems = data.items.find((item:ConsumptionItem) => item.ingredient_id === batch.ingredient_id)

        const Items:ConsumptionItem[] = findBatchInItems ? data.items.map((item:ConsumptionItem) => {
            return {
                ...item,
                ingredient_batch_id: item.ingredient_id === batch.ingredient_id ? batch.id : item.ingredient_batch_id
            }
        }) : [...data.items, { ingredient_batch_id: Number(batch.id), quantity: '', ingredient_id:+batch.ingredient_id }]

        setData('items', Items)
        setIngredientHasNoBatch((current) => current.filter((ingredient) => ingredient.id !== batch.ingredient_id))
        setSelectedIngredient(null)
    }

    const disabledSubmitButton = 
        processing || 
        fetchingAvailbleBatches || 
        availableBatches.length === 0 || 
        data.items.some((item) => item.ingredient_batch_id === '' || item.quantity === '');


    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-emerald-600">Inventory control</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">Record stock usage</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Record ingredients consumed by production or daily operations. Quantities follow each ingredient's standard unit.
                    </p>
                </div>
                <Button type="button" onClick={() =>  window.history.back()} variant={`outline`}>
                    <ArrowLeft size={16} />Back
                </Button>
            </div>
            <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-start gap-3">
                        <ClipboardPenLine size={18} />
                        <p>This record reduces normal inventory usage. It is not recorded as waste.</p>
                    </div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <InputLabel htmlFor="template_id" value="Receipt template" />
                        <Link href={route('stock-consumption-templates.create')} className="text-xs font-medium text-emerald-700 hover:underline">
                            Create template
                        </Link>
                    </div>
                    <SelectInput id="template_id" defaultValue="" onChange={(event) => handleTemplateChange(event.target.value)} className="block w-full rounded-md border-slate-200 text-sm">
                        <option value="">Manual entry</option>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name} ({template.items.length} ingredients)
                            </option>
                        ))}
                    </SelectInput>
                    <p className="mt-1 text-xs text-slate-500">
                        Selecting a receipt fills all ingredients, batches, quantities, and purpose.
                    </p>
                </div>
              
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel value="Branch" />
                        {isOwner && (
                            <>
                                {branchesList.length > 0 && (
                                    <SelectInput
                                        value={data.branch_id} 
                                        onChange={(event) => handleBranchChange(event.target.value !== '' ? +event.target.value : '')} 
                                    >
                                        <option value="">Select branch</option>
                                        {branchesList.map((branch:BranchState) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                )}
                                {(branchesList.length === 0 && !loadingBranches) && (
                                    <NoBranchesFound onAdd={() => setShowAddBranch(true)}/>
                                )}
                            </>
                        )}
                        {!isOwner && (
                            <TextInput 
                                value={branch ?? (data.branch_id ? `Branch #${data.branch_id}` : 'Selected from batch')} 
                                className="mt-1 w-full bg-slate-50" 
                                readOnly 
                            />
                        )}
                        <InputError message={errors.branch_id} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="consumption_date" value="Usage date" />
                        <TextInput 
                            id="consumption_date" 
                            type="date" 
                            className="w-full" 
                            value={data.consumption_date} 
                            onChange={(event) => setData('consumption_date', event.target.value)} 
                            required 
                            max={today} 
                        />
                        <InputError message={errors.consumption_date} className="mt-1" />
                    </div>
                </div>
                {data.branch_id && (
                    <>
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Ingredients used</h2>
                            {loadingIngredients && (
                                <Loading message={`Loading ingredients...`}/>
                            )}
                            {!loadingIngredients && (branchIngredientCount === 0 && availableBatches.length === 0) && (
                                <NoIngredientsFound onAdd={() => setShowAddIngredient(true)} />
                            )}
                            {ingredientHasNoBatch.length > 0 && (
                                <div className="rounded-md border border-sky-200 bg-sky-50 p-4">
                                    <p className="text-sm font-medium text-sky-900">
                                        Ingredients without a batch
                                    </p>
                                    <p className="mt-1 text-xs text-sky-800">
                                        Select an ingredient to add its first batch.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {ingredientHasNoBatch.map((ingredient) => (
                                            <button key={ingredient.id} type="button" onClick={() => setSelectedIngredient(ingredient)} className="rounded-md border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100">
                                                {ingredient.name} ({ingredient.unit})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {availableBatches.length > 0 && (
                                <>
                                    {data.items.map((item, index) => { 
                                        const batch = selectedBatch(item); 
                                        
                                        const ingredient = ingredientHasNoBatch.find((i: IngredientState) => i.id === item.ingredient_id)
                                        
                                        // filter items untuk mendapatkan id batch yang sudah dipilih
                                        const selectedBatches = data.items
                                        .filter((i:ConsumptionItem, idx:number) => index !== idx)
                                        .map((i:ConsumptionItem) => i.ingredient_batch_id)

                                        // set list batches menjadi batches yg belum dipilih, agar batch yg sama tidak bisa dipilih lebih dari 1 x
                                        const listBatches = availableBatches.filter((b:AvailableBatch) => {
                                            return !selectedBatches.includes(b.id)
                                        })

                                        return (
                                            <div key={index} className={`grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end`}>
                                                <div>
                                                    <InputLabel value={`Ingredient ${index + 1}`} />
                                                    <SelectInput 
                                                        value={item.ingredient_batch_id} 
                                                        onChange={(event) => handleBatchChange(index, event.target.value)}  
                                                        required>
                                                        <option value="">Select batch</option>
                                                        {listBatches.map((availableBatch) => (
                                                            <option key={availableBatch.id} value={availableBatch.id}>
                                                                {availableBatch.ingredient?.name} - {availableBatch.batch_number} ({Number(availableBatch.quantity_remaining)} {availableBatch.ingredient?.unit} available)
                                                            </option>
                                                        ))}
                                                    </SelectInput>
                                                    <InputError message={errors[`items.${index}.ingredient_batch_id`]} className="mt-1" />
                                                    {fetchingAvailbleBatches && (
                                                        <Loading message={`Loading available batches...`}/>
                                                    )}
                                                    {item.ingredient_id && !batch && (
                                                        <Alert
                                                            variant="warning"
                                                            title={`${ingredient?.name ?? 'This ingredient'} needs restocking`}
                                                            className="mt-1"
                                                        >
                                                            <div className={`flex gap-1`}>
                                                                <p className={`m-0`}>
                                                                    No batch is currently available. Restock this ingredient before recording consumption.
                                                                </p>
                                                                {ingredient && (
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => setSelectedIngredient(ingredient)}
                                                                        variant={`outline`}
                                                                        className={`border-amber-700 hover:bg-amber-100 hover:text-amber-800`}
                                                                    >
                                                                        Add Batch
                                                                    </Button>
                                                                )}
                                                            </div>

                                                        </Alert>
                                                    )}
                                                </div>
                                                <div>
                                                    <InputLabel value={`Quantity (${batch?.ingredient?.unit ?? 'unit'})`} />
                                                    <p className="mt-1 text-xs text-slate-500">Enter the amount consumed from this batch.</p>
                                                    <TextInput 
                                                        type="number" 
                                                        min="0.01" 
                                                        max={batch?.quantity_remaining} 
                                                        step="0.01" 
                                                        value={Number(item.quantity).toString()} 
                                                        onChange={(event) => updateItem(index, 'quantity', event.target.value === '' ? '' : Number(event.target.value))} 
                                                        className="w-full" 
                                                        required 
                                                    />
                                                    <InputError message={errors[`items.${index}.quantity`]} className="mt-1" />
                                                </div>
                                                <Button 
                                                    type="button"
                                                    onClick={() => removeItem(index)} 
                                                    disabled={data.items.length === 1} 
                                                    variant={`destructive`}
                                                    size={`lg`}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ); })
                                    }
                                    <div className={`flex justify-end`}>
                                        <Button type="button" variant={`outline`} onClick={addItem}>
                                            <Plus size={15} />Add ingredient
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="purpose" value="Usage Purpose" />
                                <SelectInput
                                    id="purpose"
                                    value={data.purpose}
                                    onChange={(e) => {
                                        setData('purpose', e.target.value)
                                        if(e.target.value !== 'Other') {
                                            setOtherPurpose('')
                                        }
                                    }}
                                    options={PURPOSE_OPTIONS}
                                    placeholder="Select usage purpose"
                                    required
                                />
                                {(!PURPOSE_OPTIONS.filter((p:string) => p !== 'Other').includes(data.purpose) && data.purpose !== '') && (
                                    <TextInput 
                                        value={otherPurpose} 
                                        onChange={(event) => setOtherPurpose(event.target.value)} 
                                        className="mt-1 w-full" 
                                        placeholder='E.g., Daily kitchen operations, SOP testing, catering order'
                                        required 
                                    />
                                )}
                                <p className="mt-1 text-xs text-gray-500">Describe briefly why or where this stock was used</p>
                                <InputError message={errors.purpose} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="notes" value="Notes (optional)" />
                                <TextInput 
                                    id="notes" 
                                    value={data.notes} 
                                    onChange={(event) => setData('notes', event.target.value)} 
                                    className="w-full" 
                                />
                            </div>
                        </div>
                    </>
                )}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <Button
                        type="button"
                        onClick={() =>  window.history.back()}
                        variant={`secondary`}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={disabledSubmitButton}
                    >
                        <Save size={16} className="mr-2" />
                        {processing ? 'Saving...' : 'Save stock usage'}
                    </Button>
                </div>
            </form>
            {showAddBranch && (
                <BranchFormModal 
                onSubmit={(newBranch:BranchState) => { 
                    setData('branch_id', newBranch.id)
                }} 
                closeHandler={() => setShowAddBranch(false)}
                />
            )}
            {selectedIngredient && (
                <AddBatchModal
                    ingredient={selectedIngredient}
                    onSubmit={handleBatchCreated}
                    closeHandler={() => setSelectedIngredient(null)}
                />
            )}
            {showAddIngredient && (
                <AddIngredientModal
                    user={auth.user as UserState}
                    closeHandler={() => setShowAddIngredient(false)}
                    onSubmit={(newIngrediante:IngredientState) => {
                        const firstBatch = newIngrediante.ingredient_batches?.[0]
                        if(firstBatch){
                            setData('items',[{ingredient_batch_id: firstBatch.id, quantity:'', ingredient_id: ''}])
                        }
                    }}
                    branchId={auth.user?.branch_id ?? (data.branch_id === '' ? undefined : data.branch_id)}
                />
            )}
        </div>
    );
}
