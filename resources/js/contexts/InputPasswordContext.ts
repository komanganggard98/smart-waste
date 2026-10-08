import { createContext, SetStateAction, Dispatch } from "react";

export const InputPasswordContext = createContext<{
    open:boolean,
    setOpen:Dispatch<SetStateAction<boolean>>,
    toggleOpen: () => void
}>({
    open:false,
    setOpen: (() => {}) as unknown as Dispatch<SetStateAction<boolean>>,
    toggleOpen: () => {}
})