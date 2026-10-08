import { BranchState, FormState, FormUserState, RoleState, UserState } from "@/types";
import Modal from "../Modal";
import { router, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import useFormValidator from "@/Hooks/useFormValidator";
import { userDetailFormSchema, userUpdateSchema } from "@/types/form";
import InputError from "../InputError";
import { Button } from "../ui/button";
import SelectInput, { SelectOption } from "../SelectInput";
import Alert from "../Alert";
import NoBranchesFound from "../ingredient/NoBranchesFound";
import ModalHeader from "../ModalHeader";
import BranchInputForm from "../branch/BranchInputForm";
import { Check, Copy, CopyIcon } from "lucide-react";
import { copyText, generatePassword } from "@/lib/utils";

type FormUserProps = {
    onClose: () => void,
    type:'add' | 'update',
    initialData?:UserState,
    branches:BranchState[],
    roles:RoleState[],
    user:UserState,
    onSubmit: () => void
}

export default function ModalFormUser({
    onClose,
    type,
    initialData,
    branches,
    roles,
    user,
    onSubmit
}:FormUserProps){
    const userRoles = user.roles.map((r:RoleState) => r.name)
    const isOwner = userRoles.includes('owner')
    const isBranchManager = userRoles.includes('branch_manager')

    const [copied, setCopied] = useState<boolean>(false)
    const [formState, setFormState] = useState<FormState>({
        loading:false,
        error:undefined
    })
    const [showAddBranch, setShowAddBranch] = useState<boolean>(false)
    const { clientErrors, isError, handleValidate, validateField } = useFormValidator(initialData ? userUpdateSchema : userDetailFormSchema);

    const ownerId = roles.find((r:RoleState) => r.name === 'owner')?.id
    const disabledButton = isError || (![formState.loading, formState.error].includes(undefined))

    const {data, setData, post, patch, reset, errors} = useForm<FormUserState>({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        role_id: initialData?.roles[0]?.id ?? '',
        branch_id: initialData?.branch_id ?? '',
        password: '',
    })

    const handleChange = (field: keyof typeof data, value:string) => {
        const fieldValue = ['branch_id','role_id'].includes(field) ? (value.trim().length === 0 ? value : +value) : value
        setData(field, fieldValue)
        validateField(field, fieldValue )
    }

    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()

        const isValidate = handleValidate(data)
        if(!isValidate.valid) return

        setFormState({error:undefined, loading:true})
        
        if(type === 'add'){
            post(route('users.store', {data}), {
                preserveScroll:true,
                onError:(error:Record<string, string>) => {
                    setFormState({loading:false, error: error?.store_user_error ?? error ?? 'Something wrong, try again later!'})
                },
                onSuccess:() => onSubmit(),
                onFinish:() => {
                    reset(),
                    setFormState((prev:FormState) => ({...prev, loading:false}))
                }
            })
        }else{
            patch(route('users.update',{user:initialData?.id, data}), {
                preserveScroll:true,
                preserveState:true,
                onError:(error:Record<string, string>) => {
                    console.log('error :>> ', error);
                    setFormState({loading:false, error: error?.update_user_error ?? 'Something wrong, try again later!'})
                },
                onSuccess:() => onSubmit(),
                onFinish:() => {
                    reset(),
                    setFormState((prev:FormState) => ({...prev, loading:false}))
                }
            })
        }
    }

    const branchesList:SelectOption[] = branches.
    map((b:BranchState) => ({
        label:b.name,
        value:b.id
    }))

    const rolesList:SelectOption[] = roles
    .filter((r:RoleState) => {
        if(isOwner) return true
        else if(isBranchManager) return !['branch_manager','owner'].includes(r.name)
        else return false
    }).map((r:RoleState)=> ({
        value:r.id,
        label:r.name.replaceAll('_',' ')
    }))

    useEffect(() => {
        if(!initialData){
            setData('password', generatePassword())
        }
    },[initialData])
    
    const handleCopy = (text:string) => {
        copyText(text)
        setCopied(true)
    }

    return(
        <Modal 
            show={true}
            onClose={onClose}
            maxWidth="xl"
        >
            <div className="relative w-full">
                <ModalHeader title="User" closeHandler={onClose} />
                {showAddBranch && (
                    <BranchInputForm onSubmit={() => setShowAddBranch(false)}/>
                )}
                {!showAddBranch && (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-xl">
                        {/* Alert Error General */}
                        {formState.error && (
                            <div className="px-6 pt-4">
                                <Alert variant="danger">{formState.error}</Alert>
                            </div>
                        )}

                        {/* Form Content Area (Scrollable) */}
                        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                            
                            {/* Row 1: Select Dropdowns (Branch & Role) */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {isOwner && (
                                    <div className="space-y-1.5">
                                        <InputLabel htmlFor="branch" value="Branch" />
                                        {branchesList.length > 0 && (
                                            <SelectInput
                                                autoFocus
                                                id="branch"
                                                required={+data.role_id !== ownerId }
                                                className="w-full"
                                                value={data.branch_id}
                                                options={[{ value: '', label: 'Select branch' }, ...branchesList]}
                                                onChange={(e) => handleChange('branch_id', e.target.value)}
                                            />
                                        )}
                                        {branches.length === 0 && (
                                            <NoBranchesFound onAdd={() => setShowAddBranch(true)} />
                                        )}
                                        <InputError message={(clientErrors['branch_id'] ?? errors['branch_id']) ?? ''} />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <InputLabel htmlFor="role_id" value="Role" />
                                    {rolesList.length > 0 && (
                                    <SelectInput
                                        id="role_id"
                                        autoFocus={!isOwner}
                                        required
                                        className="w-full"
                                        value={data.role_id}
                                        options={[{ value: '', label: 'Select role' }, ...rolesList]}
                                        onChange={(e) => handleChange('role_id', e.target.value)}
                                    />
                                    )}
                                    <InputError message={(clientErrors['role_id'] ?? errors['role_id']) ?? ''} />
                                </div>
                            </div>

                            {/* Row 2: Name Input */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="w-full"
                                    placeholder="e.g. John Doe"
                                    required
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                                <InputError message={(clientErrors['name'] ?? errors['name']) ?? ''} />
                            </div>

                            {/* Row 3: Email Input */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    className="w-full"
                                    placeholder="e.g. john.doe@mail.com"
                                    required
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                                <InputError message={(clientErrors['email'] ?? errors['email']) ?? ''} />
                            </div>

                            {/* Row 4: Auto-Generated Password (Hanya Tampil Saat Create / !initialData) */}
                            {!initialData && (
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="password" value="Generated Password" />
                                <div className="relative flex items-center">
                                    <TextInput
                                        id="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full pr-12 font-mono bg-slate-50 text-slate-700 select-all"
                                        readOnly
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="absolute right-1 top-1 bottom-1 px-3 flex items-center gap-1 border-0 hover:bg-slate-200 text-slate-600"
                                        onClick={() => handleCopy(data.password ?? '')}
                                        title="Copy password"
                                    >
                                        {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs text-emerald-600 font-medium">Copied</span>
                                        </>
                                        ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span className="text-xs">Copy</span>
                                        </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Save or copy this password to send to the user.
                                </p>
                                <InputError message={(clientErrors['password'] ?? errors['password']) ?? ''} />
                            </div>
                            )}
                        </div>

                        {/* Footer Actions Section */}
                        <div className="flex items-center justify-center gap-3 px-6 py-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="px-4 py-2"
                            >
                            Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={disabledButton}
                                className="px-5 py-2 font-medium"
                                >
                                {formState.loading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                )}
             </div>
        </Modal>
    )
}