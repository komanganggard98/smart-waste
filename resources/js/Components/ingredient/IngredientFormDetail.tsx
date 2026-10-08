import { IngredientFormDetailProps } from "@/types/ingredient";
import moment from "moment";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Spinner } from "flowbite-react";

export default function IngredientFormDetail({
  data, 
  branches, 
  batchData
}: IngredientFormDetailProps) {
    const totalQuantity = Number(batchData.purchase_quantity ?? 0) * Number(batchData.units_per_purchase ?? 0);
    const unitCost = totalQuantity > 0 ? Number(batchData.purchase_total_cost ?? 0) / totalQuantity : 0;
    return(
        <div>
            <h2 className={`text-lg font-semibold text-gray-800 text-center`}>Review Ingredient!</h2>
            <p className={`text-sm text-gray-500 mt-0.5 text-center`}>
                Check the details of the ingredient before submitting.
            </p>
            <div className={`my-2 max-h-[50vh] overflow-y-auto p-1`}>
                <div className={`border bg-gray-50 p-2 text-sm mb-2`}>
                    <p className={`m-0`}>Branch: {branches.find((b) => b.id === data.branch_id)?.name}</p>
                </div>
        
                <div className={`border bg-gray-50 p-2 text-xs mb-2 space-y-1`}>
                    <p className={`m-0 font-bold text-sidebar-primary underline`}>{data.name}</p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>Code: <span className={`text-end font-medium`}>{data.code}</span></p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>Unit: <span className={`text-end font-medium`}>{data.unit}</span></p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>Minimum Stock: <span className={`text-end font-medium`}>{data.minimum_stock}</span></p>
                    <p className={`m-0 flex justify-between font-semibold py-2`}>Expiry Alert Days: <span className={`text-end font-medium`}>{data.expiry_alert_days}</span></p>
                </div>
                <div className={`border bg-gray-50 p-2 text-xs mb-2 space-y-1`}>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>
                        Batch Number: <span className={`text-end font-medium`}>{batchData.batch_number ?? '-'}</span>
                    </p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>
                        Purchase Date: <span className={`text-end font-medium`}>{batchData.purchase_date ? moment(batchData.purchase_date).format('MMMM, Do YYYY') : 'N/A'}</span>
                    </p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>
                        Expiry Date: <span className={`text-end font-medium`}>{batchData.expiration_date ? moment(batchData.expiration_date).format('MMMM, Do YYYY') : 'N/A'}</span>
                    </p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>
                        Purchase: <span className={`text-end font-medium`}>{batchData.purchase_quantity ?? 0} {batchData.purchase_unit ?? ''}</span>
                    </p>
                    <p className={`m-0 border-b border-gray-300 flex justify-between font-semibold py-2`}>
                        Stock Received: <span className={`text-end font-medium`}>{totalQuantity} {data.unit}</span>
                    </p>
                    <p className={`m-0 flex justify-between font-semibold py-2`}>
                        Cost per {data.unit}:
                        <span className={`text-end font-medium`}>
                            {unitCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}