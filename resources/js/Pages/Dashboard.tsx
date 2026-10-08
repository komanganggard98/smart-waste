import AlertList from '@/Components/dashboard/AlertList';
import TopMetricRow from '@/Components/dashboard/TopMetricRow';
import AddIngredientModal from '@/Components/ingredient/AddIngredientModal';

import TextInput from '@/Components/TextInput';
import { Button } from '@/Components/ui/button';
import { BranchesProvider} from '@/contexts/BranchesContext';
import Layout from '@/Layouts/Layout';
import { IngredientState, PageProps } from '@/types';
import { MetricsState } from '@/types/dashboard';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ClipboardPenLine, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import StockMovement from '@/Components/dashboard/StockMovement';

type IngredientSearchResult = IngredientState & {
    branch?: { name: string };
};

function DashboardContent({ auth, metrics }: PageProps<{metrics: MetricsState}>) {
    const user = auth.user;
    const createStockConsumption = user?.can?.['createStockConsumption'] ?? false
    const createIngredient = user?.can?.['createIngredient'] ?? false
    const [showFormIngredient, setShowFormIngredient] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [searchResults, setSearchResults] = useState<IngredientSearchResult[]>([]);
    const [searching, setSearching] = useState<boolean>(false);

    useEffect(() => {
        const query = search.trim();
        if (!query) {
            setSearchResults([]);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setSearching(true);
            try {
                const response = await axios.get(route('ingredients.list'), {
                    params: { name: query },
                    signal: controller.signal,
                });
                const data = response.data.data;
                setSearchResults((Array.isArray(data) ? data : data.data ?? []).slice(0, 5));
            } catch (error) {
                if (!axios.isCancel(error)) setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 250);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [search]);

    return (
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* <DashboardOverview metrics={metrics} /> */}
            <div className={`flex justify-between items-center gap-3 mb-4 flex-wrap`}>
                {/* Search Input */}
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <TextInput
                        type="text"
                        placeholder="Search ingredients, SKUs..."
                        className="w-full pl-10"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {search.trim() && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                            {searching ? (
                                <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((ingredient) => (
                                    <div key={ingredient.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-800">{ingredient.name}</p>
                                            <p className="truncate text-xs text-slate-500">{ingredient.code} {ingredient.branch?.name ? `· ${ingredient.branch.name}` : ''}</p>
                                        </div>
                                        <Link
                                            href={route('ingredients.show', ingredient.uuid ?? ingredient.id)}
                                            className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Detail
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="px-4 py-3 text-sm text-slate-500">No ingredients found.</p>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Header Controls */}
                {(createStockConsumption || createIngredient) && (
                    <div className="flex items-center gap-2">
                        {createStockConsumption && (
                            <Link
                                href={route('stock-consumptions.create')}
                                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 h-8 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <ClipboardPenLine size={16} />
                                <span>Record usage</span>
                            </Link>
                        )}
                        {createIngredient && (
                            <Button 
                                type="button" 
                                className="flex items-center gap-2" 
                                onClick={() => {
                                    setShowFormIngredient(true)
                                }}
                            >
                                <Plus size={16} />
                                <span>Add Ingredient</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <TopMetricRow metrics={metrics}/>

            <div className={`grid lg:grid-cols-3 mt-4 gap-2`}>
                <div className="space-y-4 lg:col-span-2">
                    <AlertList
                        title="Ingredient Low Stock"
                        items={metrics.lowStockIngredients.ingredients}
                        emptyText="There are no low-stock ingredients."
                        totalIngredients={metrics.lowStockIngredients.total}
                        filter="low_stock"
                        user={user}
                    />
                    <AlertList
                        title="Near Expiry"
                        items={metrics.expiringIngredients.ingredients}
                        emptyText="There are no batches nearing their expiration date."
                        totalIngredients={metrics.expiringIngredients.total}
                        filter="near_expiry"
                        user={user}
                    />
                </div>
                <div className={`lg:col-span-1`}>
                    <StockMovement movements={metrics.allMovements}/>
                </div>
            </div>
            {/* <StockTrend /> */}

            {showFormIngredient && (
                <AddIngredientModal 
                    user={user} 
                    closeHandler={() => {
                        setShowFormIngredient(false)
                    }} 
                    onSubmit={() => {
                        setShowFormIngredient(false)
                    }}
                />
            )}
            
        </div>
    );
}

export default function Dashboard({ auth, metrics }: PageProps<{metrics:MetricsState}>) {
    return (
        <Layout>
            <Head title="Dashboard" />
            <BranchesProvider>
                <DashboardContent auth={auth} metrics={metrics}/>
            </BranchesProvider>
        </Layout>
    );
}
