import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

type ConfirmDeleteModalProps = {
    name: string;
    show: boolean;
    processing?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    type: 'ingredient' | 'user' | 'branch' | 'template'
};

export default function ConfirmDeleteModal({
    name,
    show,
    processing = false,
    onCancel,
    onConfirm,
    type = 'ingredient'
}: ConfirmDeleteModalProps) {
    return (
        <Modal show={show} maxWidth="md" onClose={onCancel} closeable={!processing}>
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Delete {type}?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            You are about to delete <strong className="text-slate-900">{name}</strong>.
                            This will remove the {type} from database. This action cannot be undone here.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={processing}>
                        <Trash2 className="h-4 w-4" />
                        {processing ? 'Deleting...' : `Delete ${type}`}
                    </Button>
                     <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                        Keep {type}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}