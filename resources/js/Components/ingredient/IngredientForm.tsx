import { FormIngredientState } from "@/types"
import { AvailabilityStatus } from "@/Hooks/useAvailabilityCheck"
import { Errors } from "@/Hooks/useFormValidator"
import IngredientFields from "./IngredientFields"
import IngredientFormHeader from "./IngredientFormHeader"

interface IngredientFormProps{
    branchName:string,
    data:FormIngredientState,
    setData:(fieldName: keyof FormIngredientState, value:any) => void,
    codeAvailability:AvailabilityStatus,
    clientErrors:Errors
}

export default function IngredientForm({
    branchName, 
    data, 
    setData,
    codeAvailability,
    clientErrors
}: IngredientFormProps){
    return(
        <div className={`max-h-[60vh] overflow-y-auto p-1`}>
            <IngredientFormHeader
                title="Ingredient Form"
                description="Manage ingredient details and stock reminders."
                branchName={branchName}
            />
            <IngredientFields
                data={data}
                onChange={setData}
                errors={clientErrors}
                codeAvailability={codeAvailability}
            />
        </div>
    )
}
