import { IngredientMovementState } from "@/types/dashboard";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function StockMovement({movements}:{movements:IngredientMovementState[]}){
    return(
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                {(movements && movements.length > 0 )? (
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" colSpan={3} className={`px-4 py-3 text-left`}>
                                <h1 className={` font-semibold text-slate-700`}>Stock Activity History</h1>
                                <p className={`text-xs font-light text-gray-500`}>Track incoming supply batches and outgoing stock usage</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                    {movements.map((move: IngredientMovementState, index: number) => {
                        const isIncoming = move.type === 'incoming';
                        
                        return (
                        <tr key={ `move-${index}`} className={`transition-colors hover:bg-slate-50`}>
                            {/* Icon Direction */}
                            <td className={`px-3 py-2 text-center vertical-align-middle`}>
                                <div className={`flex justify-center`}>
                                    {isIncoming ? (
                                    <ArrowUp className={`h-5 w-5 text-emerald-600`} />
                                    ) : (
                                    <ArrowDown className={`h-5 w-5 text-rose-600`} />
                                    )}
                                </div>
                            </td>

                            {/* Ingredient Details & Batch */}
                            <td className={`px-3 py-2`}>
                                <p className={`m-0 font-semibold text-slate-800`}>
                                    {move.ingredient_name}
                                </p>
                                
                                {move.batch_number && (
                                    <p className="m-0 text-xs text-slate-500 font-mono">
                                    {move.batch_number}
                                    </p>
                                )}

                                {move.description && (
                                    <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isIncoming 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                    }`}>
                                    {move.description}
                                    </span>
                                )}
                            </td>

                            {/* Quantity */}
                            <td className="px-3 py-2 text-right font-medium text-slate-900 whitespace-nowrap">
                                <span className={isIncoming ? 'text-emerald-600' : 'text-rose-600'}>
                                    {isIncoming ? '+' : '-'}{Math.abs(+move.quantity)}
                                </span>{' '}
                                <span className="text-slate-500 text-xs font-normal">{move.unit}</span>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                ) : (
                /* Empty State */
                <div className={`p-8 text-center text-slate-500`}>
                    <p className={`text-sm font-medium`}>No stock movements found.</p>
                    <p className={`text-xs text-slate-400 mt-1`}>Incoming and outgoing stock activities will appear here.</p>
                </div>
                )}
            </div>
        </div>
    )
}