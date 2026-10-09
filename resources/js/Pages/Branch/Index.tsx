import Layout from '@/Layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BranchState, RoleState } from '@/types';
import { Search, PackageSearch, Eye, Trash2, TrashIcon, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import { ToggleSwitch } from 'flowbite-react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import ConfirmActivateBranchModal from '@/Components/ConfirmActivateBranchModal';
import BranchFormModal from '@/Components/branch/BranchFormModal';

type BranchIndexRow = BranchState & { ingredients_count: number };
type BranchIndexProps = {
    data: BranchIndexRow[] | {
        data: BranchIndexRow[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters?: { is_active?: string; branch_id?: string | number; search?: string, is_archive?: 1 | 0};
};

const FILTERS = [
    ['all', 'All'],
    ['1', 'Active'],
    ['0', 'Unactive'],
]

export default function Index({ data = [], filters = {}, auth }: PageProps<BranchIndexProps>) {
    const activeFilter = filters.is_active ?? 'all';
    const archiveFilter = filters.is_archive ? +filters.is_archive : 0;
    const pagination = Array.isArray(data) ? undefined : data;
    const branches = Array.isArray(data) ? data : data.data;
    const user = auth.user
    const isOwner = user.roles.some((role: RoleState) => role.name === 'owner');
    const createBranch = user.can?.['createBranch'] ?? false
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [showAddBranch, setShowAddBranch] = useState<boolean>(false)
    const [list, setList] = useState<BranchIndexRow[]>(branches)
    const [deleteTarget, setDeleteTarget] = useState<BranchIndexRow>();
    const [activateTarget, setActivateTarget] = useState<BranchIndexRow>();
    const [deleting, setDeleting] = useState<boolean>(false);
    const [activating, setActivating] = useState<boolean>(false);
    const [detailBranch, setDetailBranch] = useState<undefined | BranchState>()
    const [showActionColumn, setShowActionColumn] = useState<boolean>(false)

    useEffect(() => {
        setShowActionColumn(branches.some(branch => branch.can?.['update'] || branch.can?.['delete']))
        setList(branches)
    },[branches])

    const deleteIngredient = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('ingredients.destroy', deleteTarget.id), {
        preserveScroll: true,
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setDeleting(false),
        });
    };
    
    const activateBranch = () => {
        if (!activateTarget?.uuid) return;
        setDeleting(true);
        router.post(route('branches.activate', activateTarget.uuid),{} ,{
            preserveScroll: true,
            preserveState: false, // Set false agar React memperbarui props komponen dengan data terbaru dari server
            onSuccess: () => setActivateTarget(undefined),
            onFinish: () => setActivating(false),
        });
    };

    const visitWithFilters = (next: Record<string, string | number | undefined>) => {
        const params = {
            is_active: activeFilter === 'all' ? undefined : activeFilter,
            is_archive: archiveFilter,
            branch_id: isOwner ? (filters.branch_id || undefined) : undefined,
            name: search || undefined,
            ...next,
        };

        router.get(route('branches.index'), params, { preserveState: true, replace: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        visitWithFilters({ name: search || undefined });
    };

    const visitPage = (page: number) => {
        visitWithFilters({ page });
    };

    return (
        <Layout>
            <Head title={`Branches`} />
            <div className={`mx-auto max-w-6xl space-y-5`}>
                <div>
                    <h1 className={`text-2xl font-semibold text-slate-900`}>Branches</h1>
                    <p className={`mt-1 text-sm text-slate-500`}>Manage branches, activation branches.</p>
                </div>

                <div className={`flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between`}>
                    <div className={`flex flex-wrap gap-2`}>
                        {FILTERS.map(([value, label]) => (
                            <Button
                                key={value}
                                type={`button`}
                                variant={activeFilter === value && archiveFilter !== 1 ? 'default' : 'outline'}
                                onClick={() => visitWithFilters({ is_active: value === 'all' ? undefined : value, is_archive:undefined })}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    <form onSubmit={submitSearch} className={`flex gap-2 items-center`}>
                        <TextInput
                            name={`search`}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={`Search name`}
                            className={`min-w-0 flex-1 lg:w-64`}
                        />
                        <Button type={`submit`}>
                            <Search className={`h-4 w-4`} />
                        </Button>
                    </form>
                </div>


                {createBranch && (
                <div className={`flex justify-end mb-2`}>
                    <Button 
                        type="button" 
                        className={`flex items-center gap-2`} 
                        onClick={() => {
                            setShowAddBranch(true);
                        }}
                    >
                        <Plus size={16} />
                        <span>Add Branch</span>
                    </Button>
                </div>
                )}
                {list.length === 0 ? (
                    <div className={`rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center`}>
                        <PackageSearch className={`mx-auto h-9 w-9 text-slate-400`} />
                        <p className={`mt-3 font-medium text-slate-700`}>No branches found</p>
                    </div>
                ) : (
                    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}>
                        <div className={`overflow-x-auto`}>
                            <table className={`min-w-full divide-y divide-slate-200 text-sm`}>
                                <thead className={`bg-slate-50`}><tr>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Branch</th>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Address</th>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Total Ingredients</th>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Active</th>
                                    {showActionColumn && (
                                        <th className={`px-4 py-3 text-right font-semibold text-slate-700`}>Action</th>
                                    )}
                                </tr></thead>
                                <tbody className={`divide-y divide-slate-200`}>
                                    {list.map((branch) => {
                                        const canUpdate = branch.can?.['update'] ?? false;
                                        const canDelete = branch.can?.['delete'] ?? false;
                                        return(
                                            <tr key={branch.id} className={`hover:bg-slate-50`}>
                                                <td className={`px-4 py-3`}>
                                                    <p className={`font-medium text-slate-900`}>{branch.name}</p>
                                                </td>
                                                <td className={`px-4 py-3 text-slate-600`}>{branch.address} </td>
                                                <td className={`px-4 py-3 text-slate-600`}>{Number(branch.ingredients_count ?? 0)}</td>
                                                <td className={`px-4 py-3 text-slate-600`}>
                                                    <ToggleSwitch 
                                                        checked={branch.is_active} 
                                                        onChange={() => setActivateTarget(branch)} 
                                                        color={`green`}
                                                        disabled={!branch.can?.['update']}
                                                    />
                                                </td>
                                                {showActionColumn && (
                                                    <td className={`px-4 py-3`}>
                                                        <div className={`flex justify-end gap-2`}>
                                                            {canUpdate && (
                                                                <Button 
                                                                    type={`button`} 
                                                                    variant={`outline`} 
                                                                    size={`sm`}
                                                                    onClick={() => setDetailBranch(branch)}
                                                                >
                                                                    <Eye className={`mr-1 h-4 w-4`} /> View
                                                                </Button>
                                                            )}

                                                            {canDelete && (
                                                                <Button
                                                                    type={`button`}
                                                                    variant={`destructive`}
                                                                    size={`sm`}
                                                                    aria-label={`Delete ${branch.name}`}
                                                                    onClick={() => setDeleteTarget(branch)}
                                                                >
                                                                    <Trash2 className={`mr-1 h-4 w-4`} /> Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    } )}
                                </tbody>
                            </table>
                        </div>
                        {pagination && pagination.last_page > 1 && (
                            <div className={`flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between`}>
                                <span>
                                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total} branches
                                </span>
                                <div className={`flex items-center gap-1`}>
                                    <Button
                                        type={`button`}
                                        size={`sm`}
                                        variant={`outline`}
                                        disabled={pagination.current_page === 1}
                                        onClick={() => visitPage(pagination.current_page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pagination.last_page }, (_, index) => index + 1).map((page) => (
                                        <Button
                                            key={page}
                                            type={`button`}
                                            size={`sm`}
                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                            onClick={() => visitPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        type={`button`}
                                        size={`sm`}
                                        variant={`outline`}
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
                    onConfirm={deleteIngredient}
                    type='branch'
                />
            )}
            {activateTarget && (
                <ConfirmActivateBranchModal
                    branch={activateTarget}
                    show
                    processing={activating}
                    onCancel={() => setActivateTarget(undefined)}
                    onConfirm={activateBranch}
                />
            )}
            {(detailBranch || showAddBranch) && (
                <BranchFormModal 
                    branch={detailBranch } 
                    onSubmit={(newBranch) => router.reload({only: ['data']})}
                    closeHandler={() => {
                        setDetailBranch(undefined)
                        setShowAddBranch(false)
                    }}
                />
            )}
        </Layout>
    );
}