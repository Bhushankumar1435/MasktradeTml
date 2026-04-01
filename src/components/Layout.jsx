import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { useState } from "react";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] bg-[#010713] overflow-hidden">

            {/* ✅ MOBILE TOP BAR — YAHAN */}
            <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-[#0f172a] text-white z-50">
                <h1 className="text-lg font-semibold">Admin Panel</h1>
                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    onDoubleClick={() => setSidebarOpen(false)}
                >
                    ☰
                </button>
            </div>

            {/* SIDEBAR */}
            <div
                className={`fixed md:relative top-0 left-0 h-[100dvh] w-[250px] bg-[#0f172a] z-50 transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <Header closeSidebar={() => setSidebarOpen(false)} />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-w-0 p-4 md:p-6 pt-[70px] md:pt-6 overflow-y-auto">
                <Outlet />
            </div>

        </div>
    );
};

export default Layout;