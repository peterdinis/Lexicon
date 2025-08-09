import { LayoutGrid, Calendar, CheckSquare, LayoutTemplate, Settings, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { FC, useEffect, useState } from "react";
import { listPages, pagesEvents } from "@/store/pageStore";
import Link from "next/link";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutGrid },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Tasks", url: "/app/tasks", icon: CheckSquare },
  { title: "Templates", url: "/app/templates", icon: LayoutTemplate },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

const DashboardSidebar: FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [pages, setPages] = useState(() => listPages());

  useEffect(() => {
    const onUpdate = () => setPages(listPages());
    window.addEventListener(pagesEvents.eventName, onUpdate);
    return () => window.removeEventListener(pagesEvents.eventName, onUpdate);
  }, []);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <span className="mr-2 grid h-4 w-4 place-items-center">+</span>
                    {!collapsed && <span>New page</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {pages.slice(0, 12).map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/app/pages/${p.id}`}>
                      <span className="mr-2 h-4 w-4 grid place-items-center">📄</span>
                      {!collapsed && <span className="truncate" title={p.title || "Untitled"}>{p.title || "Untitled"}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/app/trash">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Trash</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


export default DashboardSidebar