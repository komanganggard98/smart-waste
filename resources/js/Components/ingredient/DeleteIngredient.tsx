import { IngredientState } from "@/types";
import { router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

export default function DeleteIngredient({ingredient, refreshState}:{ingredient:IngredientState, refreshState:string[]}){
    const [deleteTarget, setDeleteTarget] = useState<IngredientState>()
    const [deleting, setDeleting] = useState(false)

    const deleteIngredient = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('ingredients.destroy', deleteTarget.uuid ?? deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(undefined);
                    router.reload({ only: refreshState });
                },
            onFinish: () => setDeleting(false),
        });
    };
    
    return(
        <>
            <Button
                type="button"
                variant={`destructive`}
                onClick={() => setDeleteTarget(ingredient)}
            >
                <Trash2 className="h-4 w-4" />
                Delete
            </Button>

            {deleteTarget && (
            <ConfirmDeleteModal
                name={deleteTarget.name}
                show
                processing={deleting}
                onCancel={() => setDeleteTarget(undefined)}
                onConfirm={deleteIngredient}
                type="ingredient"
            />
            )}
        </>
    )
}