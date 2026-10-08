
import Modal from '@/Components/Modal';
import ModalHeader from '@/Components/ModalHeader';
import { IngredientBatchState } from '@/types';
import { Button } from '../ui/button';
import moment from 'moment';


type DetailBatchModalProps = {
    batch: IngredientBatchState;
    closeHandler: () => void;
};

export default function BatchModal({ batch,  closeHandler }: DetailBatchModalProps) {
 
    return (
        <Modal show maxWidth="lg" onClose={closeHandler}>
            <div className="relative w-full">
                <ModalHeader title="Batch" closeHandler={closeHandler} />
                <div className={`py-6 px-4`}>
                    <div className={`max-h-[60vh] overflow-y-auto p-1`}>
                        {/* Ingredient */}
                        <p className={`text-md font-semibold text-green-500 bg-green-50 px-2 py-1 rounded inline-block border-green-400 border mb-3 `}>
                            {batch.ingredient?.name ?? ''}
                        </p>

                        <p className={`font-semibold mb-2`}>Purchase Information</p>
                        <div className={`grid grid-cols-1 md:grid-cols-2 bg-gray-50 text-sm`}>
                            {/* Batch Number */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Batch Number</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>{batch.batch_number ?? ''}</p>
                            </div>

                            {/* Purchase Date */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Purchase Date</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.purchase_date ? moment(batch.purchase_date).format('MMM, DD YYYY') :  ''}
                                </p>
                            </div>

                            {/* Expiration Date */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Expiration Date</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.expiration_date ? moment(batch.expiration_date).format('MMM, DD YYYY') :  ''}
                                </p>
                            </div>

                            {/* Purchase Unit */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Purchase Unit</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.purchase_unit || ''}
                                </p>
                            </div>

                            {/* Purchase Quantity */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Purchase Quantity</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.purchase_quantity ? +batch.purchase_quantity :  ''}
                                </p>
                            </div>

                            {/*Unit per Purchase */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Units per Purchase</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.units_per_purchase ? +batch.units_per_purchase + ` ${batch.ingredient?.unit}` : ''}
                                </p>
                            </div>

                            {/*Purchase Total Cost */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Purchase Total Cost</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.purchase_total_cost ? Number(batch.purchase_total_cost)
                                    .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })  :''}
                                </p>
                            </div>

                            {/*Quantity Received */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Quantity Received</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.quantity_received ? +batch.quantity_received + ` ${batch.ingredient?.unit}` : ''}
                                </p>
                            </div>

                            {/*Quantity Remaining */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Quantity Remaining</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.quantity_remaining ? +(batch.quantity_remaining) + ` ${batch.ingredient?.unit}` : ''}
                                </p>
                            </div>

                            {/*Unit Cost */}
                            <div className={`border-collapse border  p-2`}>
                                <b>Unit Cost</b>
                            </div>
                            <div className={`border-collapse border  p-2`}>
                                <p>
                                    {batch.unit_cost ? Number(batch.unit_cost)
                                    .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })  :''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}