import { SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/shadcn-space/blocks/sidebar-01/app-sidebar";
import HeaderMenu from "@/Components/HeaderMenu";
import { usePage } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { useLowStockListener } from "@/Hooks/useLowStockListener";

export default function Layout({children}:PropsWithChildren<{}>): JSX.Element {
  const auth = usePage().props.auth;
    useLowStockListener(auth?.user?.branch_id);

    return (
        <SidebarProvider>
        <AppSidebar auth={auth}/>
        {/* ---------------- Main ---------------- */}
        <div className="flex flex-1 flex-col">
            <HeaderMenu auth={auth}>
            <header className="sticky top-0 z-50 flex justify-between h-14 items-center border-b px-4 bg-white">
                <SidebarTrigger className="cursor-pointer" />
                <HeaderMenu.Trigger />
            </header>
            <HeaderMenu.ResponsiveMenu />
            </HeaderMenu>
            <main className="flex-1 p-4">{children}</main>
        </div>
        </SidebarProvider>
    );
};


