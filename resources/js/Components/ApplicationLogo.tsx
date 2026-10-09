import { Recycle } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <Recycle size={20} />
    </div>
    );
}
