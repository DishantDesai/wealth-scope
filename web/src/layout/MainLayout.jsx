import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const MainLayout = () => (
  <div className="flex h-screen">
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  </div>
);

export default MainLayout;
