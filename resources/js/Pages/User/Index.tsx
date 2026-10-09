import Layout from '@/Layouts/Layout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BranchState, RoleState,  UserState } from '@/types';
import { Search, PackageSearch, Eye, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { BranchesProvider } from '@/contexts/BranchesContext';
import ModalFormUser from '@/Components/user/ModalFormUser';

type UserIndexProps = {
    data: UserState[] | {
        data: UserState[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters?: { filter?: string; branch_id?: string | number; name?: string };
    branches: BranchState[];
    roles: RoleState[]
};

function IndexContent({ data = [], filters = {}, branches = [], roles = [], auth }: PageProps<UserIndexProps>) {
    const activeFilter = filters.filter ?? 'all';
    const user = auth.user
    const isOwner = (user.roles as RoleState[]).some((role: RoleState) => role.name === 'owner');
    const createUser = user.can?.['createUser'] ?? false
    const pagination = Array.isArray(data) ? undefined : data;
    const users = Array.isArray(data) ? data : data.data;

    const [search, setSearch] = useState(filters.name ?? '');
    const [showFormUser, setShowFormUser] = useState<boolean>(false);

    const [deleteTarget, setDeleteTarget] = useState<UserState>();
    const [deleting, setDeleting] = useState(false);

    const [detailUser, setDetailUser] = useState<undefined | UserState>()
    const [showAction, setShowAction] = useState<boolean>(false)

    useEffect(() => {
        setShowAction(users.some((u:UserState) => u.can?.['delete'] || u.can?.['update']))
    },[users])

    const deleteuser = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('user.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setDeleting(false),
        });
    };

    const visitWithFilters = (next: Record<string, string | number | undefined>) => {
        const params = {
            filter: activeFilter === 'all' ? undefined : activeFilter,
            branch_id: filters.branch_id || undefined,
            name: search || undefined,
            ...next,
        };

        router.get(route('users.index'), params, { preserveState: true, replace: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        visitWithFilters({ name: search || undefined });
    };

    const visitPage = (page: number) => {
        visitWithFilters({ page });
    };

    return (
        <>
            <div className="mx-auto max-w-6xl space-y-5">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage users informations, role.</p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">


                    <form onSubmit={submitSearch} className="flex gap-2 items-center">
                        <TextInput
                            name="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name"
                            className="min-w-0 flex-1 lg:w-64"
                        />
                        <Button type="submit" aria-label="Search users">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                {isOwner && (
                    <div className="flex items-center gap-1 justify-between">
                        <div className="flex items-center gap-3 ">
                            <label htmlFor="branch" className="text-sm font-medium text-slate-700">Branch</label>
                            <SelectInput
                                id="branch"
                                value={filters.branch_id ?? ''}
                                onChange={(event) => visitWithFilters({ branch_id: event.target.value || undefined })}
                                className={`!w-auto`}
                            >
                                <option value="">All branches</option>
                                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                            </SelectInput>
                        </div>
                        {createUser && (
                            <Button 
                                type="button" 
                                className={`flex items-center gap-2`} 
                                onClick={() => {
                                    setShowFormUser(true);
                                }
                            }>
                                <Plus size={16} />
                                <span>Add User</span>
                            </Button>
                        )}
                    </div>
                )}

                {users.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <PackageSearch className="mx-auto h-9 w-9 text-slate-400" />
                        <p className="mt-3 font-medium text-slate-700">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                                        {isOwner && <th className="px-4 py-3 text-left font-semibold text-slate-700">Branch</th>}
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                                        {showAction && (
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {users.map((user) => {
                                        const canUpdate = user.can?.['update']
                                        const canDelete = user.can?.['delete']
                                        return(
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </td>
                                            {isOwner && <td className="px-4 py-3 text-slate-600">{user.branch?.name ?? '-'}</td>}
                                            <td className="px-4 py-3 ">
                                                {user.roles[0]?.name ? (
                                                    <span className={`text-xs border-emerald-200 bg-emerald-50 text-emerald-800 rounded-full px-2 py-1`}>{user.roles[0]?.name?.replaceAll('_',' ')}</span>
                                                ): '-'}
                                            </td>
                                            {showAction && (
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        {canUpdate && (
                                                            <Button 
                                                                type="button" 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => setDetailUser(user)}
                                                            >
                                                                <Eye className="mr-1 h-4 w-4" /> View
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                aria-label={`Delete ${user.name}`}
                                                                onClick={() => setDeleteTarget(user)}
                                                            >
                                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {pagination && pagination.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total} users
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => visitPage(pagination.current_page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pagination.last_page }, (_, index) => index + 1).map((page) => (
                                        <Button
                                            key={page}
                                            type="button"
                                            size="sm"
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            onClick={() => visitPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => visitPage(pagination.current_page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {deleteTarget && (
                <ConfirmDeleteModal
                    name={deleteTarget.name}
                    show
                    processing={deleting}
                    onCancel={() => setDeleteTarget(undefined)}
                    onConfirm={deleteuser}
                    type='user'
                />
            )}
            {(showFormUser || detailUser) && (
                <ModalFormUser 
                    user={user} 
                    onClose={() => {
                        setShowFormUser(false)
                        setDetailUser(undefined)
                    }} 
                    onSubmit={() => {
                        setShowFormUser(false)
                        setDetailUser(undefined)
                    }}
                    branches={branches}
                    roles={roles}
                    type={detailUser ? 'update' : 'add'}
                    initialData={detailUser ?? undefined}
                />
            )}
        </>
    );
}

export default function Index({ data = [], filters = {}, branches = [], roles = [], auth }: PageProps<UserIndexProps>) {
    return (
        <Layout>
            <Head title="Users" />
            <BranchesProvider>
                <IndexContent
                    data={data}
                    filters={filters}
                    branches={branches}
                    roles={roles}
                    auth={auth}
                />
            </BranchesProvider>
        </Layout>
    );
}