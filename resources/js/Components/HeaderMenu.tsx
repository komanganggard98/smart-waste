import { HeaderMenuContext } from "@/contexts/HeaderMenuContext";
import React, { useContext, useState } from "react";
import Dropdown from "./Dropdown";
import { ChevronDown } from "lucide-react";
import ResponsiveNavLink from "./ResponsiveNavLink";

const HeaderMenu = ({ auth, children }: { auth: any; children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <HeaderMenuContext.Provider value={{ open, setOpen, toggleOpen, auth }}>
            {children}
        </HeaderMenuContext.Provider>
    );
};

const Trigger = () => {
    const { open, toggleOpen, auth } = useContext(HeaderMenuContext);

    return (
        <div>
            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                <div className="relative ms-3">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                >
                                    {auth?.user?.name || "User"}

                                    <ChevronDown size={13} />
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden">
                <button
                    onClick={toggleOpen}
                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path
                            className={!open ? 'inline-flex' : 'hidden'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            className={open ? 'inline-flex' : 'hidden'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ResponsiveMenu = () => {
    const { open, auth } = useContext(HeaderMenuContext);

    return (
        <div className={(open ? 'block' : 'hidden') + ' sm:hidden'}>
            <div className="space-y-1 pb-3 pt-2">
                <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                    Dashboard
                </ResponsiveNavLink>
            </div>

            <div className="border-t border-gray-200 pb-1 pt-4">
                <div className="px-4">
                    <div className="text-base font-medium text-gray-800">
                        {auth?.user?.name || 'User'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {auth?.user?.email}
                    </div>
                </div>

                <div className="mt-3 space-y-1">
                    <ResponsiveNavLink href={route('profile.edit')}>
                        Profile
                    </ResponsiveNavLink>
                    <ResponsiveNavLink method="post" href={route('logout')} as="button">
                        Log Out
                    </ResponsiveNavLink>
                </div>
            </div>
        </div>
    );
};

HeaderMenu.Trigger = Trigger;
HeaderMenu.ResponsiveMenu = ResponsiveMenu;

export default HeaderMenu;