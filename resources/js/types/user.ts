import type { BranchState } from './branch';

export interface RoleState {
    id: number;
    name: string;
}

export interface LoginFormState {
    email: string;
    password: string;
}

export interface UserState {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    branch_id: number | null;
    roles: RoleState[];
    branch?: BranchState;
    can?: Record<string, boolean>;
}

export interface FormUserState {
    name: string;
    email: string;
    branch_id: number | string;
    role_id: number | string;
    password?: string;
    user_id?: number;
}