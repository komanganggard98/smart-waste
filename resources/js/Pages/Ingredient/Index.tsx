import Layout from '@/Layouts/Layout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BranchState, RoleState, IngredientBatchState } from '@/types';
import { Search, PackageSearch, Eye, Plus, Trash2, ArchiveX } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import AddIngredientModal from '@/Components/ingredient/AddIngredientModal';
import { BranchesProvider } from '@/contexts/BranchesContext';
import { formatExpiry } from '@/lib/utils';

type IngredientIndexRow = {
    id: number;
    uuid?: string;
    name: string;
    code: string;
    unit: string;
    branch?: { id: number; name: string };
    minimum_stock: number | string;
    total_remaining?: number | string;
    nearest_expiration_date?: string;
    ingredient_batches_count?: number;
    ingredient_batches?: IngredientBatchState[];
};

type IngredientIndexProps = {
    data: IngredientIndexRow[] | {
        data: IngredientIndexRow[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters?: { filter?: string; branch_id?: string | number; search?: string };
    branches?: BranchState[];
};

const FILTERS = [
    ['all', 'All'],
    ['low_stock', 'Low stock'],
    ['near_expiry', 'Near expiry']
]

function IndexContent({ data = [], filters = {}, branches = [], auth }: PageProps<IngredientIndexProps>) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showFormIngredient, setShowFormIngredient] = useState<boolean>(false);

    const activeFilter = filters.filter ?? 'all';
    const user = auth.user
    const isOwner = (user.roles as RoleState[]).some((role: RoleState) => role.name === 'owner');
    const createIngredient = user.can?.['createIngredient'] ?? false
    const viewIngredient = user.can?.['viewIngredient'] ?? false
    const deleteIngredient = user.can?.['deleteIngredient'] ?? false
    const createIngredientBatch = user.can?.['createIngredientBatch'] ?? false
    const actionCoulumn = viewIngredient || deleteIngredient || createIngredientBatch
    const pagination = Array.isArray(data) ? undefined : data;
    const ingredients = Array.isArray(data) ? data : data.data;
    const [deleteTarget, setDeleteTarget] = useState<IngredientIndexRow>();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('ingredients.destroy', deleteTarget.uuid ?? deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(undefined),
            onFinish: () => setDeleting(false),
        });
    };

    const visitWithFilters = (next: Record<string, string | number | undefined>) => {
        const params = {
            filter: activeFilter === 'all' ? undefined : activeFilter,
            branch_id: isOwner ? (filters.branch_id || undefined) : undefined,
            search: search || undefined,
            ...next,
        };

        router.get(route('ingredients.index'), params, { preserveState: true, replace: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        visitWithFilters({ search: search || undefined });
    };

    const visitPage = (page: number) => {
        visitWithFilters({ page });
    };

    return (
        <>
            <div className={`mx-auto max-w-6xl space-y-5`}>
                <div>
                    <h1 className={`text-2xl font-semibold text-slate-900`}>Ingredients</h1>
                    <p className={`mt-1 text-sm text-slate-500`}>Manage ingredients, stock levels, and expiry alerts.</p>
                </div>

                <div className={`flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between`}>
                    <div className={`flex flex-wrap gap-2`}>
                        {FILTERS.map(([value, label]) => (
                            <Button
                                key={value}
                                type={`button`}
                                variant={activeFilter === value ? 'default' : 'outline'}
                                onClick={() => visitWithFilters({ filter: value === 'all' ? undefined : value })}
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
                            placeholder={`Search name or code`}
                            className={`min-w-0 flex-1 lg:w-64`}
                        />
                        <Button type={`submit`}>
                            <Search className={`h-4 w-4`} />
                        </Button>
                    </form>
                </div>

                {isOwner && (
                    <div className={`flex items-center gap-1 justify-between`}>
                        <div className={`flex items-center gap-3 `}>
                            <label htmlFor={`branch`} className={`text-sm font-medium text-slate-700`}>Branch</label>
                            <SelectInput
                                id={`branch`}
                                value={filters.branch_id ?? ''}
                                onChange={(event) => visitWithFilters({ branch_id: event.target.value || undefined })}
                                className={`!w-auto`}
                            >
                                <option value={``}>All branches</option>
                                {branches.map((branch) => (
                                    <option key={`branch_${branch.id}`} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                         {createIngredient && (
                            <Button 
                                type={`button`} 
                                className={`flex items-center gap-2`} 
                                onClick={() => {
                                    setShowFormIngredient(true);
                                }}
                            >
                                <Plus size={16} />
                                <span>Add Ingredient</span>
                            </Button>
                        )}
                    </div>
                )}

                {ingredients.length === 0 ? (
                    <div className={`rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center`}>
                        <PackageSearch className={`mx-auto h-9 w-9 text-slate-400`} />
                        <p className={`mt-3 font-medium text-slate-700`}>No ingredients found</p>
                    </div>
                ) : (
                    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}>
                        <div className={`overflow-x-auto`}>
                            <table className={`min-w-full divide-y divide-slate-200 text-sm`}>
                                <thead className={`bg-slate-50`}><tr>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Ingredient</th>
                                    {isOwner && (
                                        <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Branch</th>
                                    )}
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Current stock</th>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Minimum</th>
                                    <th className={`px-4 py-3 text-left font-semibold text-slate-700`}>Expiry</th>
                                    {actionCoulumn && (
                                        <th className={`px-4 py-3 text-right font-semibold text-slate-700`}>Action</th>
                                    )}
                                </tr></thead>
                                <tbody className={`divide-y divide-slate-200`}>
                                    {ingredients.map((ingredient) => {
                                        const batches = Array.isArray(ingredient.ingredient_batches) ? ingredient.ingredient_batches : [];
                                        return(
                                            <tr key={`ingredient_${ingredient.id}`} className={`hover:bg-slate-50`}>
                                                <td className={`px-4 py-3`}>
                                                    <p className={`font-medium text-slate-900`}>{ingredient.name}</p>
                                                    <p className={`text-xs text-slate-500`}>{ingredient.code}</p>
                                                </td>
                                                {isOwner && (
                                                    <td className={`px-4 py-3 text-slate-600`}>{ingredient.branch?.name ?? '-'}</td>
                                                )}
                                                <td className={`px-4 py-3 text-slate-600`}>
                                                    {+(ingredient.total_remaining ?? 0)} {ingredient.unit}
                                                </td>
                                                <td className={`px-4 py-3 text-slate-600`}>
                                                    {+(ingredient.minimum_stock)} {ingredient.unit}
                                                </td>
                                                <td className={`px-4 py-3 text-slate-600`}>
                                                    {formatExpiry(ingredient.nearest_expiration_date)}
                                                </td>
                                                {actionCoulumn && (
                                                    <td className={`px-4 py-3`}>
                                                        <div className={`flex justify-end gap-2`}>
                                                            {viewIngredient && (
                                                                <Link href={route('ingredients.show', ingredient.uuid ?? ingredient.id)}>
                                                                    <Button type={`button`} variant={`outline`}>
                                                                        <Eye className={`mr-1 h-4 w-4`} /> View
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {(ingredient.ingredient_batches_count ?? 0) === 0 && (
                                                                <>
                                                                    {createIngredientBatch && (
                                                                        <Link href={route('ingredient-batches.create', { ingredient_id: ingredient.id })}>
                                                                            <Button type={`button`} variant={`outline`}>
                                                                                <Plus className={`mr-1 h-4 w-4`} /> Add batch
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                    {deleteIngredient && (
                                                                        <Button
                                                                            type={`button`}
                                                                            variant={`destructive`}
                                                                            size={`sm`}
                                                                            onClick={() => setDeleteTarget(ingredient)}
                                                                        >
                                                                            <Trash2 className={`mr-1 h-4 w-4`} /> Delete
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {(activeFilter === 'near_expiry' && batches[0]) && (
                                                                <Link
                                                                href={route("waste-logs.create", { batch_id: batches[0].id })}
                                                                className={`inline-flex whitespace-normal items-center gap-1 rounded-md bg-red-600 px-2.5 h-8 text-sm font-medium text-white hover:bg-red-700`}
                                                                >
                                                                    <ArchiveX className={`h-4 w-4 hidden md:block`} />
                                                                    Record waste
                                                                </Link>
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
                            <div className={`flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between`}>
                                <span>
                                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total} ingredients
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
                    onConfirm={handleDelete}
                    type={`ingredient`}
                />
            )}
            {showFormIngredient && (
                <AddIngredientModal 
                    user={auth.user} 
                    closeHandler={() => {
                        setShowFormIngredient(false)
                    }} 
                    onSubmit={() => {
                        setShowFormIngredient(false)
                    }}
                />
            )}
        </>
    );
}

export default function Index({ data = [], filters = {}, branches = [], auth }: PageProps<IngredientIndexProps>) {
    return (
        <Layout>
            <Head title={`Ingredients`} />
            <BranchesProvider>
                <IndexContent
                    data={data}
                    filters={filters}
                    branches={branches}
                    auth={auth}
                />
            </BranchesProvider>
        </Layout>
    );
}