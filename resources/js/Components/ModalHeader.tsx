import { XIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ModalHeaderProps{
    closeHandler:() => void,
    title:string
}

export default function ModalHeader({title, closeHandler}:ModalHeaderProps){
    return(
        <div className={`border py-2 px-3 flex items-center justify-between bg-slate-100 rounded-t-lg`}>
            <h1>{title}</h1>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeHandler}
            >
                <XIcon size={16}  />
            </Button>
        </div>
    )
}