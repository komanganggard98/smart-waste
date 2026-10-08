import Layout from '@/Layouts/Layout';
import { FormIngredientBatchState, IngredientState, PageProps, UserState } from '@/types';
import { BranchesProvider, useBranchContext } from '@/contexts/BranchesContext';
import BranchFormModal from '@/Components/branch/BranchFormModal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardPenLine, PackagePlus, Plus, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import IngredientBatchForm from '@/Components/ingredient/IngredientBatchForm';
import { Button } from '@/Components/ui/button';
import { fetchIngredientsApi, storeIngredientApi } from '@/services/ingredientService';
import IngredientFields from '@/Components/ingredient/IngredientFields';
import IngredientFormHeader from '@/Components/ingredient/IngredientFormHeader';
import useIngredientEditor from '@/Hooks/useIngredientEditor';
import NoBranchesFound from '@/Components/ingredient/NoBranchesFound';
import Alert from '@/Components/Alert';

type IngredientBatchCreateProps = {
    ingredients: IngredientState[];
    default_ingredient_id?: number | null;
};

const today = new Date().toISOString().slice(0, 10);

export default function Create({ ingredients, default_ingredient_id }: PageProps<IngredientBatchCreateProps>) {
    return (
        <BranchesProvider>
            <CreateContent ingredients={ingredients} default_ingredient_id={default_ingredient_id} />
        </BranchesProvider>
    );
}

function CreateContent({ ingredients: initialIngredients, default_ingredient_id }: IngredientBatchCreateProps) {
    const { branches, fetchBranches, loadingBranches } = useBranchContext();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user as UserState;
    const isOwner = user.roles.some((role) => role.name === 'owner');
    const branchOptions = isOwner ? branches : branches.filter((branch) => branch.id === user.branch_id);
    const initialIngredient = initialIngredients.find((ingredient) => ingredient.id === Number(default_ingredient_id));
    const [ingredients, setIngredients] = useState<IngredientState[]>(initialIngredients);
    const [loadingIngredients, setLoadingIngredients] = useState(false);
    const [showAddBranch, setShowAddBranch] = useState(false);
    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [creatingIngredient, setCreatingIngredient] = useState(false);
    const [ingredientFormError, setIngredientFormError] = useState<string>();
    const [selectedBranch, setSelectedBranch] = useState<string | number>('')
    const { data, setData, post, processing } = useForm<FormIngredientBatchState>({
        ingredient_id: initialIngredient?.id ?? '',
        batch_number: '',
        purchase_date: today,
        expiration_date: '',
        purchase_unit: '',
        purchase_quantity: '',
        units_per_purchase: 1,
        purchase_total_cost: '',
        quantity_received: '',
        quantity_remaining: '',
        unit_cost: '',
    });
    const {
        data: ingredientData,
        setData: setIngredientData,
        handleChange: handleIngredientChange,
        reset: resetIngredient,
        clientErrors: ingredientErrors,
        handleValidate: validateIngredient,
        setClientErrors: setIngredientErrors,
        codeAvailability,
    } = useIngredientEditor({ syncInitialData: false });

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        setIngredientData((current) => ({
            ...current,
            branch_id: selectedBranch === '' ? undefined : Number(selectedBranch),
        }));
    }, [selectedBranch]);

    const selectedIngredient = ingredients.find((ingredient) => ingredient.id === Number(data.ingredient_id));
    const handleBranchChange = (value: string) => {
        const nextBranchId = value ? Number(value) : '';
        setSelectedBranch(nextBranchId)
        setData((current) => ({ ...current, ingredient_id: '' }));
        setIngredients([]);

        if(nextBranchId !== ''){
            setLoadingIngredients(true);
            fetchIngredientsApi({branch_id:nextBranchId})
                .then((availableIngredients) => {
                    setIngredients(availableIngredients);
                    setShowAddIngredient(availableIngredients.length === 0)
                })
                .catch(() => {
                    setIngredients([]);
                })
                .finally(() => {
                    setLoadingIngredients(false);
                });
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('ingredient-batches.store'), {
            onError: (error:any) => {
                console.log(error)
            }
        });
    };

    const createIngredient = async (event: FormEvent) => {
        event.preventDefault();
        setIngredientFormError(undefined);

        const validation = validateIngredient(ingredientData);
        if (!validation.valid) return;

        if (codeAvailability !== 'available') {
            setIngredientErrors((currentErrors) => ({
                ...currentErrors,
                code: codeAvailability === 'checking'
                    ? 'Please wait until the ingredient code has been checked.'
                    : 'The ingredient code could not be verified yet.',
            }));
            return;
        }

        setCreatingIngredient(true);
        try {
            const newIngredient = await storeIngredientApi(ingredientData);

            setIngredients((currentIngredients) => {
                if (currentIngredients.some((ingredient) => ingredient.id === newIngredient.id)) {
                    return currentIngredients;
                }

                return [...currentIngredients, newIngredient];
            });
            setData('ingredient_id', newIngredient.id);
            resetIngredient({
                branch_id: ingredientData.branch_id,
                with_batch: true,
            });
            setShowAddIngredient(false);
        } catch {
            setIngredientFormError('Failed to create ingredient. Please try again.');
        } finally {
            setCreatingIngredient(false);
        }
    };

    const scrollToIngredientName = () => {
        const ingredientName = document.getElementById('name')
        if(ingredientName){
            setTimeout(() => {
                ingredientName.scrollIntoView({behavior:'smooth'})
            }, 300)

            ingredientName.focus()
        }

    }
    

    return (
        <Layout>
            <Head title="Add Ingredient Batch" />
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-emerald-600">Inventory receiving</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Add ingredient batch</h1>
                        <p className="mt-1 text-sm text-slate-500">Receive stock into a tracked batch with its own expiry date, quantity, and unit cost.</p>
                    </div>
                    <Button
                        type="button"
                        onClick={() =>  window.history.back()}
                        variant={`outline`}
                    >
                        <ArrowLeft size={16} />Back
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <div className="flex items-start gap-3">
                            <PackagePlus size={18} />
                            <p>
                                Use a new batch for each stock receipt, especially when expiry date or unit cost differs.
                            </p>
                        </div>
                    </div>

                    {(branchOptions.length === 0 && !loadingBranches) ? (
                        <NoBranchesFound onAdd={() => setShowAddBranch(true)}/>
                    ) : (
                        <>
                            {default_ingredient_id && (
                                <div>
                                    <b>Ingredient:</b>
                                    <div className={`rounded border text-sm font-semibold inline-block px-2 mx-2 border-green-300 bg-green-50 text-green-500`}>
                                        {selectedIngredient?.name ?? ''}
                                    </div>
                                </div>
                            )}
                            <IngredientBatchForm
                                formData={data}
                                onChange={(field:keyof FormIngredientBatchState, value:any) => setData(field,value)}
                                clientErrors={{}}
                                ingredient={selectedIngredient}
                                ingredients={ingredients}
                                loadingIngredients={loadingIngredients}
                                handleBranchChange={default_ingredient_id ? undefined : handleBranchChange}
                                branches={branches}
                                setShowAddIngredient={(val:boolean) => {
                                    setShowAddIngredient(val)
                                    scrollToIngredientName()
                                }}
                            />
                        </>
                    )}
                    {!showAddIngredient && (
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type="button"
                                onClick={() =>  window.history.back()}
                                variant={`ghost`}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || !selectedIngredient?.branch_id || ingredients.length === 0}>
                                <Save size={14} className="mr-2" />
                                {processing ? 'Saving...' : 'Save batch'}
                            </Button>
                        </div>
                    )}
                </form>
                {showAddBranch && (
                    <BranchFormModal 
                        onSubmit={(newBranch) => { 
                            handleBranchChange(String(newBranch.id)); 
                            setShowAddBranch(false); 
                        }} 
                        closeHandler={() => setShowAddBranch(false)} 
                    />
                )}
                {showAddIngredient && (
                    <section className="mt-6 rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
                        <form onSubmit={createIngredient}>
                            <IngredientFormHeader
                                title="Add ingredient"
                                description="Create an ingredient, then it will be selected automatically for this batch."
                                branchName={branches.find((branch) => branch.id === Number(selectedBranch))?.name}
                            />
                            {ingredientFormError && (
                                <Alert variant="danger" className="mb-4">
                                    {ingredientFormError}
                                </Alert>
                            )}
                            <IngredientFields
                                data={ingredientData}
                                onChange={handleIngredientChange}
                                errors={ingredientErrors}
                                codeAvailability={codeAvailability}
                            />
                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddIngredient(false)}
                                    disabled={creatingIngredient}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creatingIngredient}>
                                    {creatingIngredient ? 'Creating...' : 'Create ingredient'}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </Layout>
    );
}
