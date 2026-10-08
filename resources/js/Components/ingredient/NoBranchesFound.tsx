import { ClipboardPenLine, Plus } from "lucide-react";

export default function NoBranchesFound({onAdd}:{onAdd:() => void}){
    return(
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <ClipboardPenLine size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">No branch available.</p>
                        <p className="mt-1">Create a branch before adding an ingredient batch.</p>
                    </div>
                </div>
                <button type="button" onClick={onAdd} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100">
                    <Plus size={15} /> Add branch
                </button>
            </div>
        </div>
    )
}