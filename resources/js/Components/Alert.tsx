import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type AlertVariant = 'info' | 'warning' | 'danger' | 'success';

type AlertProps = {
    children: ReactNode;
    variant?: AlertVariant;
    title?: string;
    className?: string;
};

const variantStyles: Record<AlertVariant, { className: string; Icon: typeof Info }> = {
    info: {
        className: 'border-sky-200 bg-sky-50 text-sky-800',
        Icon: Info,
    },
    warning: {
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        Icon: TriangleAlert,
    },
    danger: {
        className: 'border-red-200 bg-red-50 text-red-700',
        Icon: XCircle,
    },
    success: {
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        Icon: CheckCircle2,
    },
};

/** Contextual feedback message for info, warning, danger, and success states. */
export default function Alert({ children, variant = 'info', title, className }: AlertProps) {
    const { className: variantClassName, Icon } = variantStyles[variant];

    return (
        <div
            role={variant === 'danger' ? 'alert' : 'status'}
            className={cn('rounded-md border p-3 text-sm', variantClassName, className)}
        >
            <div className="flex items-start gap-3">
                <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                <div>
                    {title && <p className="font-semibold">{title}</p>}
                    <div className={cn(title && 'mt-1')}>{children}</div>
                </div>
            </div>
        </div>
    );
}
