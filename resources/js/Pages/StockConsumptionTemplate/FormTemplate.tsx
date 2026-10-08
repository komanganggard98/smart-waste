import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import Layout from '@/Layouts/Layout';
import { ReceiptTemplateForm, ReceiptTemplateFormItem } from '@/types/stock-consumption';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { PURPOSE_OPTIONS } from '@/lib/constant';
import { Button } from '@/Components/ui/button';
import Alert from '@/Components/Alert';
import { BranchState, IngredientState, PageProps, StockConsumptionTemplateItemState, StockConsumptionTemplateState, UserState } from '@/types';
import NoIngredientsFound from '@/Components/ingredient/NoIngredientsFound';
import AddIngredientModal from '@/Components/ingredient/AddIngredientModal';
import useFormValidator from '@/Hooks/useFormValidator';
import { useAutoNumberInput } from '@/Hooks/useAutoNumberInput';

type StockConsumptionTemplateFormProps = {
    ingredients: IngredientState[];
    branches: BranchState[];
    template: StockConsumptionTemplateState;
};

export default function FormTemplate({ ingredients, branches, auth, template }: PageProps<StockConsumptionTemplateFormProps>) {
    const isOwner = auth?.user?.roles?.map((r:any) => r.name).includes('owner')
    const [dataIngredients, setDataIngredients] = useState<IngredientState[]>(ingredients)
    const [listIngredients, setListIngredients] = useState<IngredientState[]>(ingredients);
    const [error, setError] = useState<string>('')
    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [otherPurpose, setOtherPurpose] = useState<string>('')
    const { handleInputChange } = useAutoNumberInput();

    const { data, setData, post, processing, errors } = useForm<ReceiptTemplateForm>({
        name: '', 
        purpose:  '', 
        notes:  '', 
        items: [{ ingredient_id: '', default_quantity: '', id: null }] ,
        branch_id: auth?.user?.branch_id ?? ''
    });

    useEffect(() => {   
        if(template){
            const templateItems = (template.items ?? [])
            const items:any = templateItems.length > 0 ? templateItems : [{ ingredient_id: '', default_quantity: '', id: null }]

            setData({
                name: template?.name ?? '', 
                purpose: template?.purpose ??  '', 
                notes: template?.notes ?? '', 
                items: items,
                branch_id: template.branch_id ?? auth?.user?.branch_id ?? ''
            })
        }
    },[template])

    const updateItem = (index: number, field: keyof ReceiptTemplateFormItem, value: number | '') => {~
        setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    } 

    const handleNumberChange = (
        value: string,
        index:number
    ) => {
        handleInputChange(value, String(data.items[index]['default_quantity'] ?? ""), (nextValue: string) => {
            updateItem(index, 'default_quantity', Number(nextValue));
        });
    };

    const addItem = () => {
        setData('items', [...data.items, { ingredient_id: '', default_quantity: '', id:null }]);
    }

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, itemIndex) => itemIndex !== index));
    }

    const submit = (event: FormEvent) => { 
        event.preventDefault(); 
        post(route('stock-consumption-templates.store'),{
            onError:(err:any) => {
                setError(err?.store_template_error ?? 'Something wrong! Try again later.')
            }
        }); 
    };

    const handleSetBranch = (value:string | number) => {
        setData('branch_id',value)
        setListIngredients(dataIngredients.filter((ingredient:IngredientState) => {
            return ingredient.branch_id === +value
        } ))
    }
    
    return <Layout>
        <Head title={`Create Receipt Template`} />
        <div className={`mx-auto max-w-3xl`}>
            <div className={`mb-6 flex items-center justify-between gap-4`}>
                <div>
                    <p className={`text-sm font-medium text-emerald-600`}>Inventory setup</p>
                    <h1 className={`mt-1 text-2xl font-semibold text-slate-900`}>{template ? 'Edit' : 'Create'} receipt template</h1>
                    <p className={`mt-1 text-sm text-slate-500`}>
                        Define reusable ingredient quantities for a recurring recipe or operating process. Each quantity uses the ingredient's standard unit.
                    </p>
                </div>
                <Button
                    type={`button`}
                    variant={`outline`}
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft size={16} />Back
                </Button>
            </div>
            <form onSubmit={submit} className={`space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
                {error !== '' && (
                    <Alert variant={`danger`} className={`mb-4`}>
                        {error}
                    </Alert>
                )}

                {isOwner && (
                    <div className={`flex items-center gap-3 `}>
                        <label htmlFor={`branch`} className={`text-sm font-medium text-slate-700`}>Branch</label>
                        <SelectInput
                            id={`branch`}
                            value={data.branch_id ?? ''}
                            onChange={(event) => handleSetBranch(event.target.value)}
                            className={`!w-auto`}
                            required
                        >
                            <option value={``}>All branches</option>
                            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                        </SelectInput>
                    </div>
                )}

                {data.branch_id && (
                    <>
                        <div>
                            <InputLabel htmlFor={`name`} value={`Receipt name`} />
                            <TextInput 
                                id={`name`} 
                                value={data.name} 
                                onChange={(event) => setData('name', event.target.value)} 
                                className={`w-full`} 
                                placeholder={`E.g., Ice Cappuccino`} 
                                required 
                            />
                            <InputError message={errors.name} className={`mt-1`} />
                        </div>
                        <div className={`grid gap-5 sm:grid-cols-2`}>
                            <div>
                                <InputLabel htmlFor={`purpose`} value={`Usage Purpose`} />
                                <SelectInput
                                    id={`purpose`}
                                    value={data.purpose}
                                    onChange={(e) => {
                                        setData('purpose', e.target.value)
                                        if(e.target.value !== 'Other') {
                                            setOtherPurpose('')
                                        }
                                    }}
                                    options={PURPOSE_OPTIONS}
                                    placeholder={`Select usage purpose`}
                                    required
                                />
                                {(!PURPOSE_OPTIONS.filter((p:string) => p !== 'Other').includes(data.purpose) && data.purpose !== '') && (
                                    <TextInput 
                                        value={otherPurpose} 
                                        onChange={(event) => setOtherPurpose(event.target.value)} 
                                        className={`mt-1 w-full`} 
                                        placeholder='E.g., Daily kitchen operations, SOP testing, catering order'
                                        required 
                                    />
                                )}
                                <p className={`mt-1 text-xs text-gray-500`}>Describe briefly why or where this stock was used</p>
                                <InputError message={errors.purpose} className={`mt-1`} />
                            </div>
                            <div>
                                <InputLabel htmlFor={`notes`} value={`Notes (optional)`} />
                                <TextInput 
                                    id={`notes`} 
                                    value={data.notes} 
                                    onChange={(event) => setData('notes', event.target.value)} 
                                    className={`w-full`} 
                                />
                            </div>
                        </div>
                        <div className={`space-y-3`}>
                            <h2 className={`text-sm font-semibold text-slate-900`}>Receipt ingredients</h2>
                            {listIngredients.length === 0 && (
                                <NoIngredientsFound onAdd={() => setShowAddIngredient(true)}/>
                            )}

                            {listIngredients.length > 0 && (
                                <>
                                    {data.items.map((item, index) => { 
                                        const ingredient = listIngredients.find((option) => option.id === Number(item.ingredient_id)); return (
                                            <div key={index} className={`grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end`}>
                                                <div>
                                                    <InputLabel value={`Ingredient ${index + 1}`} />
                                                    <SelectInput 
                                                        value={item.ingredient_id} 
                                                        onChange={(event) => {
                                                            updateItem(index, 'ingredient_id', event.target.value ? Number(event.target.value) : '')
                                                        }}
                                                        required
                                                    >
                                                        <option value={``}>Select ingredient</option>
                                                        {listIngredients.map((option) => (
                                                            <option key={`ingredient_${option.id}`} value={option.id}>
                                                                {option.name} ({option.unit})
                                                            </option>
                                                        ))}
                                                    </SelectInput>
                                                    <InputError message={errors[`items.${index}.ingredient_id`]} className={`mt-1`} />
                                                </div>
                                                <div>
                                                    <InputLabel value={`Quantity (${ingredient?.unit ?? 'unit'})`} />
                                                    <p className={`mt-1 text-xs text-slate-500`}>Default amount used each time this template is applied.</p>
                                                    <TextInput 
                                                        type={`number`} 
                                                        min={`0.01`} 
                                                        step={`0.01`} 
                                                        value={String(item.default_quantity ? +item.default_quantity : '0')} 
                                                        onChange={(event) => handleNumberChange(event.target.value, index)} 
                                                        className={`mt-1 w-full`} required 
                                                    />
                                                    <InputError message={errors[`items.${index}.default_quantity`]} className={`mt-1`} />
                                                </div>
                                                <Button 
                                                    type={`button`} 
                                                    onClick={() => removeItem(index)} 
                                                    disabled={data.items.length === 1} 
                                                    variant={`destructive`}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ) 
                                    })}
                                    <div className={`flex justify-end`}>
                                        <Button 
                                            type={`button`} 
                                            variant={`outline`}
                                            onClick={addItem} 
                                        >
                                            <Plus size={15} />Add ingredient
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={`flex justify-end gap-2 border-t border-slate-100 pt-5`}>
                            <Link 
                                href={route('stock-consumptions.create')} 
                                className={`rounded-md px-4 h-8 flex items-center justify-center text-sm font-medium text-slate-600 hover:bg-slate-50`}
                            >
                                Cancel
                            </Link>
                            <Button type={`submit`} disabled={processing || listIngredients.length === 0}>
                                <Save size={16} className={`mr-2`} />{processing ? 'Saving...' : 'Save template'}
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </div>

        {showAddIngredient && (
            <AddIngredientModal
                user={auth.user as UserState}
                closeHandler={() => setShowAddIngredient(false)}
                onSubmit={(newIngrediante:IngredientState) => {
                    setDataIngredients([...ingredients, newIngrediante])
                    setShowAddIngredient(false)
                }}
                branchId={auth.user?.branch_id ?? +data.branch_id}
                branchesList={branches}
            />
        )}
    </Layout>;
}
