import { Button } from "@/Components/ui/button";
import { IngredientBatchState, IngredientState } from "@/types";
import { Link, router } from "@inertiajs/react";
import {  ArchiveX, ArrowRightIcon, ChevronRight, Eye, Plus } from "lucide-react";
import moment from "moment";
import { Fragment, useState } from "react";
import AddBatchModal from "../ingredient/AddBatchModal";
import DeleteIngredient from "../ingredient/DeleteIngredient";
import { formatExpiry } from "@/lib/utils";
import DetailBatchModal from "../ingredient/DetailBatchModal";

export default function AlertList({
  title,
  items,
  emptyText,
  totalIngredients,
  filter = 'low_stock',
  user
}: {
  title: string;
  items: IngredientState[];
  emptyText: string;
  totalIngredients:number;
  filter?: 'low_stock' | 'near_expiry';
  user:any
}) {
  const [addBatch, setAddBatch] = useState<undefined | IngredientState>()
  const [showBatch, setShowBatch] = useState<undefined | IngredientBatchState>()
  const createIngredientBatch = user?.can?.['createIngredientBatch'] ?? false
  const deleteIngredientBatch = user?.can?.['deleteIngredientBatch'] ?? false
  const createWasteLog = user?.can?.['createWasteLog'] ?? false
  const viewIngredientBatch = user?.can?.['viewIngredientBatch'] ?? false
  const actionColumn = createIngredientBatch || deleteIngredientBatch || createWasteLog || viewIngredientBatch

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 justify-between">
        <div className={`flex items-center gap-2`}>
          <h1 className="text-base font-semibold">{title}</h1>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium border-amber-200 bg-amber-50 text-amber-700`}
          >
            {totalIngredients}
          </span>
        </div>
        {totalIngredients > items.length && (
          <Link href={route('ingredients.index', { filter })} className={`text-sm`}>
            See more <ArrowRightIcon className="inline-block h-3 w-3" />
          </Link>
        )}
      </div>

      <div className={``}>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500 w-full min-h-[100px] text-center flex justify-center items-center">
            <p className="font-medium text-slate-700">{emptyText}</p>
          </div>
        ) : (
          <>
          <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Ingredient</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 text-left">{filter === 'low_stock' ? 'Stock' : 'Expiry'}</th>
                          {actionColumn && (
                            <th className="px-4 py-3 font-semibold text-slate-700 text-right">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                          {items.map((ingredient) => {
                            const batches = Array.isArray(ingredient.ingredient_batches) ? ingredient.ingredient_batches : [];
                            const latestBatch = batches.find((b:IngredientBatchState) => b.quantity_remaining > 0);
                            const hasBatches = batches.length > 0;
                            return (
                              <Fragment key={ingredient.id}>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-4 py-5">
                                      <p className="font-medium text-slate-900">
                                        {ingredient.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {ingredient.code}
                                      </p>
                                    </td>
                                    <td className="px-4 py-5 text-slate-600">
                                      {filter === 'low_stock' && (
                                        <>
                                          <p>Current stock: {Number(latestBatch?.quantity_remaining ?? 0)} {ingredient.unit}</p>
                                          <p>Minimum: {Number(ingredient.minimum_stock)} {ingredient.unit}</p>
                                        </>
                                      )}
                                      {filter == 'near_expiry' && (
                                        <>
                                            {latestBatch ? formatExpiry(moment(latestBatch?.expiration_date).format('YYYY-MM-DD')) : '-'}
                                        </>
                                      )}
                                    </td>
                                    {actionColumn && (
                                      <td className={`px-4 py-5`}>
                                        <div className="flex justify-end flex-wrap gap-2">
                                          {filter === 'low_stock' && (
                                            <>
                                              {createIngredientBatch && (
                                              <Link href={route('ingredient-batches.create', { ingredient_id: ingredient.id })}>
                                                  <Button type="button" variant="outline" aria-label={`Add batch for ${ingredient.name}`}>
                                                      <Plus className="h-4 w-4" /> Add batch
                                                  </Button>
                                              </Link>
                                              )}
                                              {(!hasBatches && deleteIngredientBatch) && (
                                                <DeleteIngredient 
                                                  ingredient={ingredient}
                                                  refreshState={['metrics']}
                                                />
                                              )}
                                            </>
                                          )}
                                          {filter === 'near_expiry' && (
                                            <>
                                              {latestBatch?.id && (
                                                <>
                                                  {viewIngredientBatch && (
                                                    <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() => setShowBatch({...latestBatch, ingredient: {...ingredient}})}
                                                    >
                                                      <Eye className="h-4 w-4 hidden md:block" />
                                                      View batch
                                                    </Button>
                                                  )}
                                                  {createWasteLog && (
                                                    <Link
                                                      href={route("waste-logs.create", { batch_id: latestBatch.id })}
                                                      className="inline-flex whitespace-normal items-center gap-1 rounded-md bg-red-600 px-2.5 h-8 text-sm font-medium text-white hover:bg-red-700"
                                                    >
                                                      <ArchiveX className="h-4 w-4 hidden md:block" />
                                                      Record waste
                                                    </Link>
                                                  )}
                                                </>
                                              )}
                                            </>
                                          )}
                                        </div>

                                      </td>
                                    )}
                                </tr>
                              </Fragment>
                            )
                          }
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
          </>
        )}
      </div>

      {addBatch !== undefined && (
        <AddBatchModal 
            ingredient={addBatch}
            onSubmit={() => {
              router.reload({only: ['metrics']})
            }}
            closeHandler={() => setAddBatch(undefined)}
        />
      )}

      {showBatch !== undefined && (
        <DetailBatchModal 
            batch={showBatch}
            closeHandler={() => setShowBatch(undefined)}
        />
      )}

    </section>
  );
}