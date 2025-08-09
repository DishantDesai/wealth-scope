// components/layout/Sidebar.jsx
import {
  Home,
  LineChart,
  Coins,
  Settings,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  { title: "Holdings", url: "/holdings", icon: BarChart3 },
  { title: "Transactions", url: "/transactions", icon: Coins },
  { title: "Dividends", url: "/dividends", icon: LineChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppSidebar() {
  return (
    <Sidebar className="border-r z-40">
      <SidebarHeader className="border-b px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">WealthView</h1>
            <p className="text-xs text-muted-foreground">Personal Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ title, icon: Icon, url }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      key={url}
                      to={url}
                      className="flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">
              john@example.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
