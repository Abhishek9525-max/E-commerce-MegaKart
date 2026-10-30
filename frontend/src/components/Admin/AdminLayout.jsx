import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((isOpen) => !isOpen);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f7f6f2] md:flex-row">
      <header className="z-20 flex items-center gap-4 border-b border-[#e8e5de] bg-white px-5 py-4 text-[#414b36] md:hidden">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={isSidebarOpen}
          className="flex h-11 w-11 items-center justify-center"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <span className="font-serif text-lg font-semibold">Admin Suite</span>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-[min(90vw,300px)] overflow-y-auto border-r border-[#e8e5de] bg-white transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      <main className="min-w-0 flex-grow overflow-auto bg-[#f7f6f2] p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
