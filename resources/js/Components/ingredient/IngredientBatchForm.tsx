import InputLabel from '../InputLabel';
import TextInput from '../TextInput';
import { IngredientBatchFormProps } from '@/types/ingredient-batch';
import InputError from '../InputError';
import { PURCHASE_UNITS } from '@/lib/constant';
import { BranchState, IngredientState } from '@/types';
import SelectInput from '../SelectInput';
import NoIngredientsFound from './NoIngredientsFound';
import { useAutoNumberInput } from '@/Hooks/useAutoNumberInput';

const today = new Date().toISOString().slice(0, 10);

export default function IngredientBatchForm({ 
    formData, 
    onChange, 
    clientErrors,
    ingredient,
    ingredients,
    loadingIngredients = false,
    branches,
    handleBranchChange,
    setShowAddIngredient
}: IngredientBatchFormProps) {

    const isIngredientEmpty = setShowAddIngredient !== undefined && !loadingIngredients && ingredients?.length === 0
    const { handleInputChange } = useAutoNumberInput();

    const handleNumberChange = (
        field: 'purchase_quantity' | 'units_per_purchase' | 'purchase_total_cost',
        value: string,
    ) => {
        handleInputChange(value, String(formData[field] ?? ''), (nextValue: string) => {
            onChange(field, Number(nextValue));
        });
    };
    
    return (
        <div className={`grid gap-5 sm:grid-cols-2`}>
            {handleBranchChange !== undefined && (
            <>
                <div className={`sm:col-span-2`}>
                    <InputLabel htmlFor={`branch_id`} value={`Branch`} />
                    <SelectInput 
                        id={`branch_id`} 
                        value={ingredient?.branch_id} 
                        onChange={(event) => handleBranchChange(event.target.value.toString())} 
                        required
                    >
                        <option value={``}>Select branch</option>
                        {branches?.map((branch: BranchState) => {
                            return(
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            )
                        })}
                    </SelectInput>
                </div>
                <div className={`sm:col-span-2`}>
                    {isIngredientEmpty && (
                        <NoIngredientsFound onAdd={() => setShowAddIngredient(true)} />
                    )}
                    {!isIngredientEmpty &&(
                        <>
                            <InputLabel htmlFor={`ingredient_id`} value={`Ingredient`} />
                            <SelectInput 
                                id={`ingredient_id`} 
                                value={formData.ingredient_id} 
                                disabled={loadingIngredients || ingredients?.length === 0} 
                                onChange={(event) =>  onChange('ingredient_id', event.target.value ? Number(event.target.value) : '')} 
                                className={`${loadingIngredients || ingredients?.length === 0 ? 'hover:cursor-not-allowed' : ''}`}
                                required
                            >
                                <option value={``}>
                                    {loadingIngredients ? 'Loading ingredients...' : 'Select ingredient'}
                                </option>
                                {ingredients?.map((ingredient:IngredientState) => {
                                    return(
                                        <option key={ingredient.id} value={ingredient.id}>
                                            {ingredient.name} ({ingredient.unit})
                                        </option>
                                    )
                                })}
                            </SelectInput>
                            {ingredient && (
                                <p className={`mt-1 text-xs text-slate-500`}>
                                    Branch: {ingredient.branch?.name ?? 'Selected branch'} · Unit: {ingredient.unit}
                                </p>
                            )}
                            <InputError message={clientErrors['ingredient_id']} className={`mt-1`} />
                        </>
                    )}
                </div>
            </>
            )}

            {(ingredient || !isIngredientEmpty) && (
                <>
                    <div className={`sm:col-span-2`}>
                        <InputLabel htmlFor={`batch_number`} value={`Batch number`} />
                        <TextInput 
                            id={`batch_number`} 
                            value={formData.batch_number} 
                            onChange={(event) => onChange('batch_number', event.target.value)} className={`w-full`} 
                            placeholder={`Example: BATCH-2026-001`} 
                        />
                        <p className={`mt-1 text-xs text-slate-500`}>
                            Use the batch number from the supplier when available.
                        </p>
                        <InputError message={clientErrors['batch_number']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`purchase_date`} value={`Purchase date`} />
                        <TextInput 
                            id={`purchase_date`} 
                            type={`date`} 
                            value={formData.purchase_date} 
                            onChange={(event) => onChange('purchase_date', event.target.value)} 
                            className={`w-full`} 
                            required 
                        />
                        <InputError message={clientErrors['purchase_date']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`expiration_date`} value={`Expiration date`} />
                        <TextInput 
                            id={`expiration_date`} 
                            type={`date`} 
                            min={formData.purchase_date || today} 
                            value={formData.expiration_date} 
                            onChange={(event) => onChange('expiration_date', event.target.value)} 
                            className={`w-full`} 
                            required 
                        />
                        <InputError message={clientErrors['expiration_date']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`purchase_unit`} value={`Purchase unit`} />
                        <SelectInput 
                            id={`purchase_unit`} 
                            value={formData.purchase_unit} 
                            onChange={(event) => onChange('purchase_unit', event.target.value)} 
                            required
                        >
                            <option value={``}>Select purchase unit</option>
                            {PURCHASE_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </SelectInput>
                        <InputError message={clientErrors['purchase_unit']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`purchase_quantity`} value={`Purchase quantity`} />
                        <TextInput 
                            id={`purchase_quantity`} 
                            type={`number`} 
                            min={`0.01`} 
                            step={`0.01`} 
                            value={String(formData.purchase_quantity)} 
                            onChange={(event) => handleNumberChange('purchase_quantity', event.target.value)}
                            className={`w-full`} 
                            required 
                            inputMode={`numeric`}

                        />
                        <InputError message={clientErrors['purchase_quantity']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`units_per_purchase`} value={`Base units per purchase (${ingredient?.unit ?? 'unit'})`} />
                        <TextInput 
                            id={`units_per_purchase`} 
                            type={`number`} 
                            min={`0.0001`} 
                            step={`0.0001`} 
                            value={String(formData.units_per_purchase)} 
                            onChange={(event) => handleNumberChange('units_per_purchase', event.target.value)}
                            className={`w-full`} 
                            required 
                            inputMode={`numeric`}
                        />
                        <InputError message={clientErrors['units_per_purchase']} className={`mt-1`} />
                    </div>
                    <div>
                        <InputLabel htmlFor={`purchase_total_cost`} value={`Total purchase cost`} />
                        <TextInput 
                            id={`purchase_total_cost`} 
                            type={`number`} 
                            min={`0`} 
                            step={`1`} 
                            value={String(formData.purchase_total_cost)} 
                            onChange={(event) => handleNumberChange('purchase_total_cost', event.target.value)}
                            className={`w-full`} 
                            required 
                        />
                        <p className={`mt-1 text-xs text-slate-500`}>
                            System calculates total stock and cost per base unit.
                        </p>
                        <InputError message={clientErrors['purchase_total_cost']} className={`mt-1`} />
                    </div>
                </>
            )}
        </div>

    );
}
