"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/Components/ui/sidebar";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { NavItem, NavMain } from "@/Components/shadcn-space/blocks/sidebar-01/nav-main";
import {  FileWarning, LayoutDashboard, Package, ReceiptText, Settings2, Store, Users } from "lucide-react";
import { Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export const navData: NavItem[] = [
  { label: "Workspace", isSection: true },
  { title: "Dashboard", icon: LayoutDashboard, href: route("dashboard") },
  { title: "Ingredients", icon: Package, href: route("ingredients.index"), permission:'viewAnyIngredient' },
  { title: "Stock usage", icon: ReceiptText, href: route("stock-consumptions.index"), permission:'viewAnyStockConsumption' },
  { title: "Template", icon: ReceiptText, href: route("stock-consumption-templates.index"), permission:'viewAnyStockConsumptionTemplate' },
  { title: "Waste logs", icon: FileWarning, href: route("waste-logs.index"), permission:'viewAnyWasteLog' },
  { label: "Administration", isSection: true },
  { title: "Branches", icon: Store, href: route("branches.index"), permission:'viewAnyBranch' },
  { title: "Users", icon: Users, href: route("users.index"), permission:'viewAnyUser' },
  { title: "Profile", icon: Settings2, href: route("profile.edit") },
];

export function AppSidebar({auth}:{auth:any}) {
  return (
    <Sidebar className="px-0 h-full [&_[data-slot=sidebar-inner]]:h-full">
      <div className="flex flex-col gap-6">
        {/* ---------------- Header ---------------- */}
        <SidebarHeader className="px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={route("dashboard")} className="flex items-center gap-3 py-1">
                  <ApplicationLogo />
                  <div>
                    <p className="text-sm font-bold tracking-wide text-slate-900">SMART WASTE</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700">Inventory control</p>
                  </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ---------------- Content ---------------- */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="px-4">
              <NavMain items={navData} user={auth.user} />
            </div>
          </ScrollArea>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
