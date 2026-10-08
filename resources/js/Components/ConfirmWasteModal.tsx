import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, ClipboardX } from 'lucide-react';

type ConfirmWasteModalProps = {
    ingredientName: string;
    batchNumber: string;
    quantity: number | string;
    unit: string;
    reason: string;
    show: boolean;
    processing?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmWasteModal({
    ingredientName,
    batchNumber,
    quantity,
    unit,
    reason,
    show,
    processing = false,
    onCancel,
    onConfirm,
}: ConfirmWasteModalProps) {
    return (
        <Modal show={show} maxWidth="md" onClose={onCancel} closeable={!processing}>
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Confirm waste record</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            This will reduce active stock and create a waste history record. Please review the details before continuing.
                        </p>
                    </div>
                </div>

                <dl className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-xs text-slate-500">Ingredient</dt>
                        <dd className="mt-1 font-medium text-slate-900">{ingredientName}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">Batch</dt>
                        <dd className="mt-1 font-medium text-slate-900">{batchNumber}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">Waste quantity</dt>
                        <dd className="mt-1 font-medium text-slate-900">{quantity} {unit}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">Reason</dt>
                        <dd className="mt-1 font-medium text-slate-900">{reason}</dd>
                    </div>
                </dl>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                        Review details
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={processing}>
                        <ClipboardX className="h-4 w-4" />
                        {processing ? 'Saving...' : 'Confirm waste record'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}