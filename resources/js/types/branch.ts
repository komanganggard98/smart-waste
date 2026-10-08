import type { ReactElement } from 'react';

export interface BranchState {
    id: number;
    uuid: string;
    name: string;
    address: string;
    is_active: boolean;
    deleted_at?: string;
}

export interface FormBranchState {
    id?: string | number;
    uuid?: string;
    name: string;
    address: string;
    is_active: boolean;
}

export interface BranchInputFormProps {
    onSubmit: (branch: BranchState) => void;
    initialData?: FormBranchState;
    header?: ReactElement;
    submitText?: string;
    onCancel?: () => void;
}

export interface SelectBranchOptionProps {
    branches: BranchState[];
    selectedBranch?: number;
    setIsAdding: (value: boolean) => void;
    onSelectBranch?: (branch: BranchState) => void;
    nextHandler: () => void;
}
