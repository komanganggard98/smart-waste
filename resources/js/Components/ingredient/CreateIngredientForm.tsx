import { Button } from "../ui/button"
import { BranchState, FormIngredientBatchState, FormIngredientState, FormState, IngredientState } from "@/types"
import BranchForIngredient from "../branch/BranchForIngredient"
import { useEffect, useState } from "react"
import SectionProgress from "../SectionProgress"
import { Alert, Spinner} from "flowbite-react"
import { IngredientFormProps } from "@/types/ingredient"
import useFormValidator from "@/Hooks/useFormValidator"
import { ingredientBatchFormSchema, ingredientFormSchema } from "@/types/form"
import { checkIngredientCodeApi, storeIngredientApi } from "@/services/ingredientService"
import { router } from "@inertiajs/react"
import { ChevronLeft, SkipForward } from "lucide-react"
import IngredientBatchForm from "./IngredientBatchForm"
import axios from 'axios';
import IngredientFormDetail from "./IngredientFormDetail"
import { handleServerValidation } from "@/lib/utils"
import IngredientForm from "./IngredientForm"
import useAvailabilityCheck, { AvailabilityStatus } from "@/Hooks/useAvailabilityCheck"

// Jika user owner, maka owner harus memiliki branch terlebih atau menambahkan branch baru sebelum menambahkan ingredient.
// Jka user bukan owner, maka ingredient otomatis untuk branch user tersebut.

export default function CreateIngredientForm({
    user,
    branches,
    onSubmit,
    branchId,
    submitLabel = 'Submit'
}: IngredientFormProps){
    const isOwner = user?.roles.some((role) => role.name === 'owner');
    const totalStep:number = isOwner ? 4 : 3
    const [step, setStep] = useState<number>(isOwner ? 1 : 2);

    const { clientErrors, isError, handleValidate, validateField, setClientErrors } = useFormValidator(ingredientFormSchema);
    const { clientErrors:clientErrorsBatch, isError:isErrorBatch, handleValidate:handleValidateBatch, validateField:validateFieldBatch, setClientErrors: setBatchErrors } = useFormValidator(ingredientBatchFormSchema);

    const [formState, setFormState] = useState<FormState>({
        loading:false,
        error:undefined
    })
    
    const [data, setData] = useState<FormIngredientState>({
        branch_id: user?.branch_id ?? (branchId ?? undefined),
        code:'',
        name:'',
        unit:'',
        minimum_stock: 0,
        expiry_alert_days: 0,
        with_batch: true,
    })

    const codeAvailability:AvailabilityStatus = useAvailabilityCheck({
        value: data.code,
        enabled: Boolean(data.branch_id),
        isValid: (value) => value.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(value),
        check: (code, signal) => checkIngredientCodeApi(code, data.branch_id as string | number, null, signal),
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

    const [batchData, setBatchData] = useState<FormIngredientBatchState>({
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
    })


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

    const handleBatchChange = (field: keyof FormIngredientBatchState, value: any) => {
        setFormState({
            loading:false,
            error:undefined
        })
        const nextBatchData = { ...batchData, [field]: value };
        setBatchData(nextBatchData);
        validateFieldBatch(field, value, nextBatchData);
    }

    const handleSkipBatch = () => {
        setStep(4);
        setData((prev:FormIngredientState) => ({...prev, with_batch:false}) );
        setBatchData({
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
    }

    const handleSubmitValidation = (serverErrors: Record<string, unknown>) => {
        handleServerValidation({
            serverErrors,
            setClientErrors: (normalizedErrors) => {
                const ingredientErrors: Record<string, string> = {};
                const batchErrors: Record<string, string> = {};

                Object.entries(normalizedErrors).forEach(([field, message]) => {
                    if (field.startsWith('batch.')) {
                        batchErrors[field.replace('batch.', '')] = message;
                    } else {
                        ingredientErrors[field] = message;
                    }
                });

                setClientErrors(ingredientErrors);
                setBatchErrors(batchErrors);
            },
            setFormState,
            onFirstField: (field) => {
                setStep(field.startsWith('batch.') ? 3 : 2);
            },
            normalizeField: (field) => field,
        });
    }

    const handleSubmit = async () => {
        setFormState({loading:true, error:undefined})

        try{
            const newIngredient = await storeIngredientApi({...data, batch:batchData})
            onSubmit(newIngredient)
            router.reload()
        }catch(err){
            const response = axios.isAxiosError(err) ? err.response : undefined;

            if (response && [402, 422].includes(response.status)) {
                handleSubmitValidation(response.data?.errors ?? {});
            } else {
                setFormState({loading:false, error: `Failed creating ingredient!`})
            }
        }finally{
            setFormState((prev:FormState) => ({...prev, loading:false}))
        }
    }

    const handleNext = () => {
        if(step === 3){
            const validate = handleValidateBatch(batchData)
            if (!validate.valid) return;
        }
        if(step === 2){
            const validate = handleValidate(data);
            if (!validate.valid) return;
            if (codeAvailability !== 'available') {
                setClientErrors((previousErrors) => ({
                    ...previousErrors,
                    code: codeAvailability === 'checking'
                        ? 'Please wait until the ingredient code has been checked.'
                        : 'The ingredient code could not be verified yet.',
                }));
                return;
            }
        }
        setStep((prevStep) => prevStep + 1);
    }

    const handlePrevious = () => {
        if(step === 3){
            handleValidate(data)
        }
  
        setStep((prevStep) => prevStep - 1);
    }

    useEffect(() => {
        if(branchId){
            setStep(2)
        }
    },[branchId])

    return(
        <div className={` bg-white rounded-lg w-full p-6`}>
            {formState.error && (
                <Alert color="failure" className={`text-xs mb-2 py-2 px-3`}>{formState.error}</Alert>
            )}
            {/* Tampilkan section progress ketika user owner (tidak memiliki branch_id) */}
            {!user?.branch_id && (
                <SectionProgress 
                    length={totalStep}
                    step={step}
                />
            )}

            {/* Step 1 hanya untuk user owner (tidak memiliki branch_id) */}
            {step === 1 && (
                <BranchForIngredient
                    branches={branches}
                    onAddBranch={(branch: BranchState) => {
                        setData((prev:FormIngredientState) => ({...prev, branch_id:branch.id}) );    
                    }}
                    onSelectBranch={(branch: BranchState) => {
                        setData((prev:FormIngredientState) => ({...prev, branch_id:branch.id}) );    
                    }}
                    nextHandler={() => handleNext()}
                    selectedBranch={!data.branch_id ?  undefined : +data.branch_id }
                />
            )}

            {step > 1 && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleNext()
                }}>
                    {(step === 2) && (
                        <IngredientForm 
                            branchName={branches.find((branch:BranchState) => branch.id === data.branch_id)?.name ?? ''}
                            data={data}
                            setData={handleSetData}
                            codeAvailability={codeAvailability}
                            clientErrors={clientErrors}
                        />
                    )}

                    {step === 3 && (
                        <div className={`max-h-[60vh] overflow-y-auto p-1`}>
                             <div className="mb-4">
                                <h2 className="text-lg text-center font-semibold text-gray-800">Ingredient Batch</h2>
                                <p className="text-sm text-center text-amber-600">
                                    Add the opening stock batch now, or skip it and receive stock later. Quantities use {data.unit || 'the ingredient unit'}.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={handleSkipBatch}
                                >
                                    <SkipForward className="h-4 w-4 mr-1" />
                                    Skip for now
                                </Button>
                            </div>

                            <div>
                                <b>Ingredient:</b>
                                <div className={`rounded border text-sm font-semibold inline-block px-2 mx-2 border-green-300 bg-green-50 text-green-500`}>
                                    {data.name}
                                </div>
                            </div>

                            <IngredientBatchForm
                                formData={batchData}
                                onChange={handleBatchChange}
                                clientErrors={clientErrorsBatch}
                                ingredient={data as IngredientState}
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <IngredientFormDetail
                            data={data}
                            branches={branches}
                            batchData={batchData}
                        />
                    )}

                    <div className={`flex justify-between items-center gap-3 mt-4`}>
                        <Button
                            type="button"
                            onClick={handlePrevious}
                            variant={`outline`}
                        >
                            <ChevronLeft /> Back 
                        </Button>
                        {step < totalStep && (
                            <Button
                                type="submit"
                                disabled={ (step === 2 && isError) || (step === 3 && isErrorBatch)}
                            >
                                Continue
                            </Button>
                        )}

                        {step === totalStep && (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={formState.loading || (step === 2 && isError) || (step === 3 && isErrorBatch)}
                            >
                                {formState.loading ? (
                                    <>
                                        <Spinner color="success" light={true} size='xs' /> Submitting...
                                    </>
                                ) : submitLabel}
                            </Button>
                        )}
                    </div>
                </form>
            )}

        </div>
    )
}