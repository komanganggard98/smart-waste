import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/button';
import { StockConsumptionTemplateState } from '@/types';
import { AlertTriangle, Trash2 } from 'lucide-react';

type ConfirmActivateTemplateModalProps = {
    template: StockConsumptionTemplateState;
    show: boolean;
    processing?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmActivateTemplateModal({
    template,
    show,
    processing = false,
    onCancel,
    onConfirm,
}: ConfirmActivateTemplateModalProps) {
    return (
        <Modal show={show} maxWidth="md" onClose={onCancel} closeable={!processing}>
            <div className="p-6">
                <div className={`flex items-start gap-4`}>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600`}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold text-slate-900`}>
                            {template.is_active ? 'Deactivate' : 'Activate'} template?
                        </h2>
                        <p className={`mt-2 text-sm leading-6 text-slate-600`}>
                            You are about to {template.is_active ? 'deactivate' : 'activate'}{' '}
                            <strong className="text-slate-900">{template.name}</strong>. 
                            This will change the template status in your system. You can change this setting again later.
                        </p>
                    </div>
                </div>
                <div className={`mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4`}>
                    <Button 
                        type="button" 
                        variant={template.is_active ? 'destructive' : 'default'} 
                        onClick={onConfirm} 
                        disabled={processing}
                    >
                    {processing 
                        ? (template.is_active ? 'Deactivating...' : 'Activating...') 
                        : (template.is_active ? 'Deactivate' : 'Activate')}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
}