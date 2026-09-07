import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0e1013] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <main className="flex-1 p-4 sm:p-6 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
