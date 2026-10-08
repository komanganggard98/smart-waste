import TextInput from "../TextInput";
import InputLabel from "../InputLabel";
import { Button } from "../ui/button";
import { useState } from "react";
import { useBranchContext } from "@/contexts/BranchesContext";
import { storeBranchApi } from "@/services/branchService";
import useFormValidator from "@/Hooks/useFormValidator";
import { branchFormSchema } from "@/types/form";
import { Spinner, ToggleSwitch } from "flowbite-react";
import InputError from "../InputError";
import { BranchInputFormProps } from "@/types/branch";
import { FormBranchState, FormState } from "@/types";
import Alert from "../Alert";

export default function BranchInputForm({ onSubmit, initialData, header, submitText = 'Save Branch & Next', onCancel }: BranchInputFormProps){
    const { addBranch } = useBranchContext()
    const { clientErrors, isError, handleValidate, validateField } = useFormValidator(branchFormSchema);
    
    const [ formState, setFormState] = useState<FormState>({
      loading:false,
      error: undefined
    })

    const [ formBranch , setFormBranch ] = useState<FormBranchState>({
      name: initialData?.name ?? '',
      address: initialData?.address ??  '',
      is_active: initialData?.is_active ?? false
    })

    const handleSetData = (field: keyof typeof formBranch, value:any) => {
        setFormBranch((prev:FormBranchState) => ({...prev, 
          [field]:value
        }))
        validateField( field, value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { valid } = handleValidate(formBranch);
        if (!valid) return;

        setFormState({loading:true, error: undefined})
        try {
            // pake axios untuk mendapatkan id dari branch yg dibuat
            const newBranch = await storeBranchApi(formBranch);

            // 1. UPDATE STATE GLOBAL (Semua komponen yang pakai context ini otomatis ikut ter-update)
            addBranch(newBranch);

            // 2. Kunci otomatis ID baru ke formulir internal modal
            onSubmit(newBranch)


        } catch (error) {
            console.error("Gagal menyimpan cabang:", error);
            setFormState({loading:false, error: `Failed creating branch!`})

        }finally{
          setFormState((prev:FormState) => ({...prev, loading:false}))
        }


    };

    return (
      <form 
        onSubmit={handleSubmit} 
        className="w-full bg-white space-y-4"
      >
        {/* Form Fields */}
        <div className={`space-y-4 max-h-[50vh] overflow-auto`}>
          {/* Header Section */}
          {header ? header : (
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                New Branch
              </h2>
              <p className="text-xs text-gray-500">
                Enter the branch details below to create a new location.
              </p>
            </div>
          )}

          {/* Alert Error General */}
          {formState.error && (
            <div className="px-6 pt-4">
              <Alert variant="danger">{formState.error}</Alert>
            </div>
          )}
          {/* Field 1: Branch Name */}
          <div className="space-y-1.5">
            <InputLabel htmlFor="branchName">
              Branch Name <span className="text-red-500">*</span>
            </InputLabel>
            <TextInput
              type="text"
              id="branchName"
              value={formBranch.name || ''}
              onChange={(e) => handleSetData('name', e.target.value)}
              placeholder="e.g. Branch Jakarta Selatan"
              className="w-full"
              required
            />
            <InputError message={clientErrors['name']} />
          </div>

          {/* Field 2: Branch Address */}
          <div className="space-y-1.5">
            <InputLabel htmlFor="branchAddress">
              Branch Address <span className="text-red-500">*</span>
            </InputLabel>
            <textarea
              id="branchAddress"
              value={formBranch.address || ''}
              onChange={(e) => handleSetData('address', e.target.value)}
              placeholder="e.g. Jl. Jendral Sudirman No. 123, Jakarta"
              rows={3}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-soft,#3b82f6)] focus:border-[var(--brand-primary,#2563eb)] transition-all resize-none shadow-xs"
            />
            <InputError message={clientErrors['address']} />
          </div>

          {/* Field 3: Active Status Toggle */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-gray-800 block">
                  Branch Status
                </span>
                <p className="text-xs text-gray-500">
                  {formBranch.is_active 
                    ? 'This branch will be active immediately' 
                    : 'Branch will be set to inactive'}
                </p>
              </div>
              <ToggleSwitch
                id="isActive"
                checked={!!formBranch.is_active}
                onChange={() => handleSetData('is_active', !formBranch.is_active)}
                color="blue"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={formState.loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className={`py-2.5 font-medium flex items-center justify-center gap-2`}
            disabled={isError || formState.loading}
          >
            {formState.loading ? (
              <>
                <Spinner color="light" size="xs" />
                <span>Submitting...</span>
              </>
            ) : submitText}
          </Button>
        </div>
      </form>
    );
}