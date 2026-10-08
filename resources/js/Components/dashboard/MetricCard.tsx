import { Card, CardContent, CardHeader } from "../ui/card";

interface MetricCardProps{
    title:string,
    icon:any,
    subtitle:string,
    value: string | number,
    tone?: "default" | "warning" | "danger" | "success";
}

export default function MetricCard({
    title,
    icon:Icon,
    subtitle,
    value,
    tone = 'default'
}: MetricCardProps){

    const toneClass = {
        default: "bg-slate-50 text-slate-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
        success: "bg-emerald-50 text-emerald-700",
    };
    return(
        <Card className="p-5 justify-between">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-slate-500">{title}</span>
                    <div className={`w-8 h-8 rounded-lg ${toneClass[tone]} flex items-center justify-center`}>
                        <Icon size={18} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6 flex gap-1 items-baseline justify-between">
                    <span className="text-3xl font-bold text-slate-900">
                        {subtitle}
                    </span>
                    <span className="text-xs text-slate-400 font-medium overflow-ellipsis whitespace-nowrap line-clamp-1">
                        {value}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}