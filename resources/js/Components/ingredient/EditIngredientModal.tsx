import Modal from '@/Components/Modal';
import ModalHeader from '@/Components/ModalHeader';
import { Alert, Spinner } from 'flowbite-react';
import { FormEvent, useEffect, useState } from 'react';
import { FormIngredientState, FormState, IngredientState } from '@/types';
import IngredientForm from './IngredientForm';
import useFormValidator from '@/Hooks/useFormValidator';
import { ingredientFormSchema } from '@/types/form';
import useAvailabilityCheck, { AvailabilityStatus } from '@/Hooks/useAvailabilityCheck';
import { checkIngredientCodeApi, updateIngredientApi } from '@/services/ingredientService';
import { Button } from '../ui/button';
import axios from 'axios';
import { handleServerValidation } from '@/lib/utils';

type EditIngredientProps = {
    ingredient: IngredientState;
    closeHandler: () => void;
    onSubmit?: (updatedIngredient?: IngredientState) => void;
};

export default function EditIngredientModal({ ingredient, closeHandler, onSubmit }: EditIngredientProps) {

    const [data, setData] = useState<FormIngredientState>(ingredient)
    const [formState, setFormState] = useState<FormState>({
        loading:false,
        error:undefined
    })
    const { clientErrors, isError, handleValidate, validateField, setClientErrors } = useFormValidator(ingredientFormSchema);
    
    useEffect(() => {
        setData(ingredient)
    }, [ingredient]);

    const handleSetData = (field: keyof FormIngredientState, value:any) => {
        setFormState({
            loading:false,
            error:undefined
        })
        setData({
            ...data,
            [field]:value
        })
        validateField(field, value)
    }

    const codeAvailability:AvailabilityStatus = useAvailabilityCheck({
        value: data.code,
        enabled: Boolean(data.branch_id),
        isValid: (value) => value.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(value),
        check: (code, signal) => checkIngredientCodeApi(code, data.branch_id as string | number, ingredient.id, signal),
        onStatusChange: (status) => {
            if (status === 'available') {
                setClientErrors((previousErrors:any) => {
                    const nextErrors = { ...previousErrors };
                    delete nextErrors.code;
                    return nextErrors;
                });
            }

            if (status === 'unavailable') {
                setClientErrors((previousErrors:any) => ({
                    ...previousErrors,
                    code: 'This ingredient code is already used in the selected branch.',
                }));
            }
        },
    });

    const submit = async (e:FormEvent) => {
        e.preventDefault()

        const isValidate = handleValidate(data)
        if(!isValidate) return

        setFormState({loading:true, error:''})
        try{
            await updateIngredientApi(ingredient.uuid, data)
            setFormState({...formState, loading:false})

            if(onSubmit !== undefined){
                onSubmit()
            }
        }catch(err:any){
            const response = axios.isAxiosError(err) ? err.response : undefined
            if(response &&  [422, 400].includes(response.status)){
                const errors:Record<string, string> = response?.data?.errors ?? {}
                handleServerValidation({
                    serverErrors:errors,
                    setClientErrors: (normalizedErrors) => {
                        const ingredientErrors: Record<string, string> = {};
        
                        Object.entries(normalizedErrors).forEach(([field, message]) => {
                            ingredientErrors[field] = message;
                        });
        
                        setClientErrors(ingredientErrors);
                    },
                    setFormState,
                    normalizeField: (field) => field,
                });
            }else{
                setFormState({loading:false, error: `Failed creating ingredient!`})
            }
        }finally{
            setFormState((prev:FormState) => ({...prev, loading:false}))
        }
    }

    return (
        <Modal show maxWidth="lg" onClose={closeHandler} closeable={!formState.loading}>
            <div className="relative w-full">
                <ModalHeader title="Edit ingredient" closeHandler={closeHandler} />

                <form onSubmit={submit} className={`py-6 px-4`}>
                    {formState.error && (
                        <Alert color="failure" className={`text-xs mb-2 py-2 px-3`}>{formState.error}</Alert>
                    )}
                    <IngredientForm 
                        branchName={ingredient?.branch?.name ?? ''}
                        data={data}
                        setData={handleSetData}
                        codeAvailability={codeAvailability}
                        clientErrors={clientErrors}
                    />
                    <div className={`flex justify-end mt-4`}>
                        <Button
                            type="submit"
                            disabled={isError || formState.loading}
                        >
                            {formState.loading ? (
                                <>
                                <Spinner color="success" light={true} size='xs' /> Submitting ...
                                </>
                            ): 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
