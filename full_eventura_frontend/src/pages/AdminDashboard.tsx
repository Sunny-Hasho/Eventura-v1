import { useState } from "react";
import DashboardStats from "@/components/admin/DashboardStats";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" storageKey="eventura-admin-theme">
      <div className="relative min-h-screen bg-background">
        <AdminSidebar
          isCollapsed={!isSidebarOpen}
          onCollapse={() => setIsSidebarOpen(false)}
        />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-all duration-300",
            isSidebarOpen ? "md:pl-64" : "md:pl-20"
          )}
        >
          <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="mb-8">
              <DashboardStats />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
