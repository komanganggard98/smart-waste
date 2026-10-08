import Modal from '@/Components/Modal';
import BranchInputForm from './BranchInputForm';
import { BranchState, FormBranchState } from '@/types';
import ModalHeader from '../ModalHeader';

interface BranchFormModalProps{
    onSubmit:(newBranch:BranchState) => void,
    closeHandler: () => void,
    branch?:BranchState
}

export default function BranchFormModal({onSubmit, closeHandler, branch}: BranchFormModalProps){
    const header = () => {
        if(!branch) return 
        return(
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Edit Branch
                </h2>
                <p className="text-xs text-gray-500">
                    Enter the branch details below to create a new location.
                </p>
            </div>
        )
    }
     return(
        <Modal
            show={true} 
            maxWidth={`lg`}
            onClose={closeHandler}
        >
             <div className={`w-full relative`}>
                <ModalHeader title={`Branch`} closeHandler={closeHandler} />
                <div className={`p-5`}>
                    <BranchInputForm 
                        initialData={branch as FormBranchState}
                        onSubmit={(newBranch) => {
                            onSubmit(newBranch)
                            closeHandler()
                        }}    
                        header={header()}
                        submitText={'Save'}
                        onCancel={closeHandler}
                    />
                </div>
            </div>
        </Modal>
    )
}