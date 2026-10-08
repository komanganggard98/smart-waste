import { useEffect } from 'react';
// import Swal from 'sweetalert2';
import { echo } from '@/echo';

interface LowStockEventPayload {
    notif:LowStockNotification
}

interface LowStockNotification {
    branch_id: number;
    type: string;
    title: string;
    message: string;
    category: string;
    action_url: string;
}

export const useLowStockListener = (branchId: number | null) => {
    // useEffect(() => {
    //     if (!branchId) return;

    //     const channel = echo.channel(`branch.${branchId}`);

    //     channel.listen('.low-stock.detected', (data: Data) => {
    //         // Swal.fire({
    //         //     icon: 'warning',
    //         //     title: data.notif.title,
    //         //     html: data.notif.message,
    //         //     toast: true,
    //         //     position: 'top-end',
    //         //     showConfirmButton: false,
    //         //     timer: 5000,
    //         //     timerProgressBar: true,
    //         // });
    //     });

    //     return () => {
    //         channel.stopListening('.low-stock.detected');
    //     };
    // }, [branchId]);
};