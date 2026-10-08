import { AvailabilityStatus } from "@/Hooks/useAvailabilityCheck"
import { CheckCircle2, Info, TriangleAlert, CheckIcon } from 'lucide-react';


const CodeStyles:Record<string, {className:string, Icon: typeof Info}> = {
    unavailable : {
        className: 'text-red-600',
        Icon: TriangleAlert
    },
    available: {
        className: 'text-green-600',
        Icon: CheckIcon
    }
}

export default function CodeAvailability({status}: {status:AvailabilityStatus} ){
    if(!['unavailable','available'].includes(status)) return

    const {className: variantClassName, Icon} = CodeStyles[status]
    return (
        <div className={`mt-1 text-xs ${variantClassName} flex items-center gap-1`}>
            Code is {status} <Icon size={12} />
        </div>
    )
}