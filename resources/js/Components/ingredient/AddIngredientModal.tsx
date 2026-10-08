import CreateIngredientForm from '@/Components/ingredient/CreateIngredientForm';
import Modal from '@/Components/Modal';
import { useBranchContext } from '@/contexts/BranchesContext';
import { AlertCircleIcon } from 'lucide-react';
import ModalHeader from '../ModalHeader';
import { BranchState, IngredientState, UserState } from '@/types';
import { useEffect } from 'react';

import { Alert } from 'flowbite-react';
import SpinnerWithOverlay from '../SpinnerWithOverlay';

interface AddIngredientModalProps{
    user:UserState,
    closeHandler:() => void,
    onSubmit:(newIngredient:IngredientState) => void,
    branchId?:number,
    branchesList?:BranchState[]
}

export default function AddIngredientModal({user, closeHandler, onSubmit, branchId, branchesList }: AddIngredientModalProps){
    const { branches, loadingBranches, fetchBranches, errorBranches } = useBranchContext();
    useEffect(() => {
        if(!branchesList){
            fetchBranches(false)
        }
    },[branchesList])
    
    return(
        <Modal 
            show={true} 
            onClose={closeHandler}
            maxWidth={`xl`}
            closeable={!loadingBranches}
        >   
            <div className={`w-full relative`}>
                <ModalHeader title={`Ingredient`} closeHandler={closeHandler} />
                {errorBranches && (
                    <Alert color="failure" rounded={false} withBorderAccent={true}>
                        <AlertCircleIcon size={`12`} className={`inline`}/> {errorBranches}
                    </Alert>
                )}

                {loadingBranches && (
                    <SpinnerWithOverlay text={`Please wait...`}/>
                )}
    
                <CreateIngredientForm 
                    user={user}
                    branches={branchesList ?? branches}
                    onSubmit={(newIngrediante:IngredientState) => onSubmit(newIngrediante)}
                    branchId={branchId}
                />
            </div>
        </Modal>
    )
}