import { createContext, SetStateAction, Dispatch } from "react";

type HeaderMenuContextType = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
    auth: any;
};

export const HeaderMenuContext = createContext<HeaderMenuContextType>({
    open: false,
    setOpen: (() => {}) as unknown as Dispatch<SetStateAction<boolean>>,
    toggleOpen: () => {},
    auth: null,
});