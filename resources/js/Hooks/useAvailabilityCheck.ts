import { useEffect, useRef, useState } from 'react';

export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable';

type CheckAvailability = (value: string, signal: AbortSignal) => Promise<boolean>;

type UseAvailabilityCheckOptions = {
    value: string;
    check: CheckAvailability;
    enabled?: boolean;
    delay?: number;
    isValid?: (value: string) => boolean;
    onStatusChange?: (status: AvailabilityStatus) => void;
};

export default function useAvailabilityCheck({
    value,
    check,
    enabled = true,
    delay = 400,
    isValid = (input) => input.length > 0,
    onStatusChange,
}: UseAvailabilityCheckOptions): AvailabilityStatus {
    const [status, setStatus] = useState<AvailabilityStatus>('idle');
    const checkRef = useRef(check);
    const isValidRef = useRef(isValid);
    const onStatusChangeRef = useRef(onStatusChange);

    checkRef.current = check;
    isValidRef.current = isValid;
    onStatusChangeRef.current = onStatusChange;

    const updateStatus = (nextStatus: AvailabilityStatus) => {
        setStatus(nextStatus);
        onStatusChangeRef.current?.(nextStatus);
    };

    useEffect(() => {
        const normalizedValue = value.trim();

        if (!enabled || !isValidRef.current(normalizedValue)) {
            updateStatus('idle');
            return;
        }

        const controller = new AbortController();
        updateStatus('checking');

        const timeoutId = window.setTimeout(async () => {
            try {
                const available = await checkRef.current(normalizedValue, controller.signal);
                updateStatus(available ? 'available' : 'unavailable');
            } catch (error) {
                if (!controller.signal.aborted) {
                    updateStatus('idle');
                }
            }
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [delay, enabled, value]);

    return status;
}
