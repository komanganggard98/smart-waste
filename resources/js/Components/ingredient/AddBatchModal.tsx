
import Modal from '@/Components/Modal';
import ModalHeader from '@/Components/ModalHeader';
import { storeBatchApi } from '@/services/batchService';
import { FormIngredientBatchState, FormState, IngredientState } from '@/types';
import { AvailableBatch } from '@/types/stock-consumption';
import axios from 'axios';
import { FormEvent, useState } from 'react';
import IngredientBatchForm from './IngredientBatchForm';
import useFormValidator from '@/Hooks/useFormValidator';
import { ingredientBatchFormSchema } from '@/types/form';
import { Button } from '../ui/button';
import { Alert, Spinner } from 'flowbite-react';
import { handleServerValidation } from '@/lib/utils';


type AddBatchModalProps = {
    ingredient: IngredientState;
    onSubmit: (batch: AvailableBatch) => void;
    closeHandler: () => void;
};

export default function AddBatchModal({ ingredient, onSubmit, closeHandler }: AddBatchModalProps) {
    const { clientErrors, isError, handleValidate, validateField, setClientErrors } = useFormValidator(ingredientBatchFormSchema);
    const [form, setForm] = useState<FormIngredientBatchState>({
        ingredient_id:ingredient.id,
        batch_number: '',
        purchase_date: '',
        expiration_date: '',
        purchase_unit: '',
        purchase_quantity: 0,
        units_per_purchase: 1,
        purchase_total_cost: 0,
        quantity_remaining: 0,
        quantity_received: 0,
        unit_cost: 0,
    });

    const [formState, setFormState] = useState<FormState>({
        loading:false,
        error:undefined
    })

    const handleBatchChange = (field: keyof FormIngredientBatchState, value: any) => {
        setFormState({
            loading:false,
            error:undefined
        })
        const nextBatchData = { ...form, [field]: value };
        setForm(nextBatchData);
        validateField(field, value, nextBatchData);
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setFormState({...formState, loading:true});

        const validate = handleValidate(form);
        if (!validate.valid) {
            setFormState({...formState, loading:false});
            return
        };
        try {
            const newBatch = await storeBatchApi(form)
            onSubmit(newBatch);
            closeHandler();
        } catch (error: any) {
            const response = axios.isAxiosError(error) ? error.response : undefined;

            if (response && [402, 422].includes(response.status)) {
                handleServerValidation({
                    serverErrors: response.data?.errors ?? {},
                    setClientErrors,
                    setFormState,
                });
            } else {
                setFormState({loading:false, error: `Failed creating ingredient!`})
            }
        } finally {
            setFormState({...formState, loading:false});
        }
    };


    return (
        <Modal show maxWidth="lg" onClose={closeHandler}>
            <div className="relative w-full">
                <ModalHeader title="Add batch" closeHandler={closeHandler} />
                <form onSubmit={submit} className={`py-6 px-4`}>
                    {formState.error && (
                        <Alert color="failure" className={`text-xs mb-2 py-2 px-3`}>{formState.error}</Alert>
                    )}
                    <div className={`max-h-[60vh] overflow-y-auto p-1`}>
                         <div className="mb-4">
                            <h2 className="text-lg text-center font-semibold text-gray-800">
                                Ingredient Batch
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 text-center">
                                Record one stock receipt as a separate batch for expiry, quantity, and cost tracking.
                            </p>
                        </div>
                        <div>
                            <b>Ingredient:</b>
                            <div className={`rounded border text-sm font-semibold inline-block px-2 mx-2 border-green-300 bg-green-50 text-green-500`}>
                                {ingredient.name}
                            </div>
                        </div>
                        <IngredientBatchForm
                            formData={form}
                            onChange={handleBatchChange}
                            clientErrors={clientErrors}
                            ingredient={ingredient}
                        />
                    </div>
                    <div className={`flex justify-center mt-4`}>
                        <Button
                            type="submit"
                            disabled={formState.loading || isError}
                        >
                            {formState.loading ? (
                                <>
                                    <Spinner color="success" light={true} size='xs' /> Submitting...
                                </>
                            ) : 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}