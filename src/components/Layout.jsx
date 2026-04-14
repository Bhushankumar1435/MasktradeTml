import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import { useState } from "react";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { pathname } = useLocation();

    return (
        <div className="flex h-[100dvh] bg-brand-dark overflow-hidden font-poppins relative">
            
            {/* Subtle background glow effect for aesthetics */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            {/* Extra ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-gold/3 rounded-full blur-[150px] pointer-events-none"></div>

            {/* ✅ MOBILE TOP BAR */}
            <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center p-4 glass-header text-white z-50 animate-slide-down">
                <Link to="/" className="flex items-center gap-2">
                    <img className="w-8 h-8" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg font-semibold text-brand-gold text-glow">Admin Panel</h1>
                </Link>
                <button
                    className="py-0.5 px-2 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    onDoubleClick={() => setSidebarOpen(false)}
                >
                    ☰
                </button>
            </div>

            {/* SIDEBAR */}
            <div
                className={`fixed md:relative top-0 left-0 h-[100dvh] w-[260px] glass-panel z-50 transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <Header closeSidebar={() => setSidebarOpen(false)} />
            </div>

            {/* MAIN CONTENT — keyed by pathname so each route re-animates */}
            <div className="flex-1 min-w-0 p-4 md:p-8 pt-[80px] md:pt-8 overflow-y-auto overflow-x-hidden z-10 relative">
                <div className="max-w-[1600px] mx-auto overflow-x-hidden">
                    <div key={pathname} className="page-enter">
                        <Outlet />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Layout;
