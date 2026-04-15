import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import headerjson from "../../json/Header.json";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { adminLogoutApi, getAllNotificationsApi } from "../../ApiService/Adminapi";
import {
  FaHome,
  FaUsers,
  FaLink,
  FaUserCheck,
  FaWallet,
  FaChartLine,
  FaMoneyBillWave,
  FaBox,
  FaImage,
  FaTicketAlt,
  FaPlusCircle,
  FaList,
  FaUserShield,
  FaMinusCircle,
  FaArrowUp,
  FaChartBar,
  FaCheckCircle,
  FaChartPie,
  FaLayerGroup,
  FaExchangeAlt,
  FaRandom,
  FaBell,
  FaSignOutAlt,
  FaArrowDown
} from "react-icons/fa";

const Header = ({ closeSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const iconMap = {
    FaHome, FaUsers, FaLink, FaUserCheck, FaWallet, FaChartLine,
    FaMoneyBillWave, FaBox, FaImage, FaTicketAlt, FaPlusCircle, FaList,
    FaUserShield, FaMinusCircle, FaArrowUp, FaChartBar, FaCheckCircle,
    FaChartPie, FaLayerGroup, FaExchangeAlt, FaRandom, FaBell,FaArrowDown
  };

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotificationsApi(1, 20);
      const unread = res?.data?.data?.filter(n => !n.isRead)?.length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleToggle = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  useEffect(() => {
    headerjson.forEach((item, index) => {
      if (item.children?.some(sub => sub.path === location.pathname)) {
        setOpenMenu(index);
      }
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await adminLogoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      navigate("/login");
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#020817]/80 backdrop-blur-md text-gray-200 flex flex-col font-poppins relative overflow-hidden">

      {/* Ambient glow inside sidebar */}
      <div className="absolute top-0 left-0 w-full h-32 bg-brand-gold/5 blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-blue-900/10 blur-[60px] pointer-events-none"></div>

      {/* LOGO AREA — slide down on mount */}
      <div
        onClick={() => closeSidebar?.()}
        className="p-6 border-b border-white/5 cursor-pointer md:cursor-default relative animate-slide-down"
        style={{ animationDuration: '0.4s' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <Link to="/" className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 glow-animate transition-transform hover:scale-110">
            <img className="w-8 h-6 md:w-9 md:h-7 object-contain" src={"/Images/favicon.png"} alt="logo" />
          </Link>
          <h2 className="text-xl md:text-2xl font-bold tracking-wide text-brand-gold text-glow">
            Masktrades
          </h2>
        </div>
      </div>

      {/* NAV ITEMS */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-2">

        {headerjson.map((item, index) => {
          const isParentActive = item.children
            ? item.children.some((sub) => location.pathname === sub.path)
            : location.pathname === item.path;

          // Stagger delay per nav item
          const delay = `${0.08 + index * 0.05}s`;

          return (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: delay, animationFillMode: 'both' }}
            >

              {/* MAIN MENU ITEM */}
              <div
                onClick={(e) => {
                  if (item.children) {
                    e.preventDefault();
                    handleToggle(index);
                  } else {
                    closeSidebar?.();
                  }
                }}
              >
                <NavLink
                  to={item.path || "#"}
                  className={`relative px-4 py-3 rounded-xl flex justify-between items-center transition-colors duration-300 group overflow-hidden border border-transparent
               ${isParentActive
                      ? "bg-brand-gold/10 border-brand-gold/30 shadow-[inset_0_0_20px_rgba(214,162,16,0.15)] text-white"
                      : "text-gray-400 hover:text-white border-transparent"
                    }`}
                >
                  {/* Active left-bar indicator */}
                  {isParentActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-brand-gold shadow-glow-gold rounded-r-md block animate-scale-in z-20"></div>
                  )}

                  {/* Premium left-to-right Glassmorphism fill */}
                  <div className={`absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${isParentActive ? 'bg-gradient-to-r from-brand-gold/20 via-brand-gold/5 to-transparent' : 'bg-gradient-to-r from-white/10 via-white/5 to-transparent'}`}></div>

                  {/* Glowing sweep line on bottom */}
                  <div className={`absolute left-0 bottom-0 h-[1px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-20 pointer-events-none ${isParentActive ? 'bg-gradient-to-r from-brand-gold/50 to-transparent' : 'bg-gradient-to-r from-white/30 to-transparent'}`}></div>

                  <span className="flex items-center gap-3 relative z-10 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                    {item.icon && iconMap[item.icon] && (
                      <span
                        className={`text-lg transition-all duration-300 group-hover:scale-110 ${
                          isParentActive ? "text-brand-gold drop-shadow-md" : "text-gray-500 group-hover:text-brand-gold/80"
                        }`}
                      >
                        {React.createElement(iconMap[item.icon])}
                      </span>
                    )}
                    {item.title === "Notification" ? unreadCount > 0 && (
                      <span className="flex items-center text-sm font-medium">
                        <span>{item.title}</span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse">
                          {unreadCount > 10 ? "10+" : unreadCount}
                        </span>
                      </span>
                    ) : <span className="text-sm font-medium tracking-wide whitespace-nowrap">{item.title}</span>
                    }
                  </span>

                  {item.children && (
                    <span className={`text-xs transition-all duration-300 relative z-10 text-gray-500 group-hover:text-gray-300 ${openMenu === index ? "rotate-180" : "rotate-0"}`}>
                      <FaChevronDown />
                    </span>
                  )}
                </NavLink>
              </div>

              {/* SUB MENU — slides down with stagger */}
              {item.children && openMenu === index && (
                <div className="ml-4 mt-2 flex flex-col gap-1 animate-slide-down" style={{ animationDuration: '0.25s' }}>
                  {item.children.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      onClick={() => closeSidebar?.()}
                      style={{ animationDelay: `${subIndex * 0.04}s`, animationFillMode: 'both' }}
                      className={({ isActive }) =>
                        `relative px-4 py-2.5 text-sm rounded-lg flex items-center gap-3 transition-colors duration-300 group animate-fade-in-up overflow-hidden
                        ${isActive
                          ? "bg-white/5 text-white border-l-2 border-brand-gold shadow-[inset_0_0_10px_rgba(255,215,0,0.05)]"
                          : "text-gray-400 hover:text-white border-l-2 border-transparent"
                        }`
                      }
                    >
                      {/* Premium Sub-item hover left-to-right fill */}
                      <div className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-r from-white/10 to-transparent pointer-events-none rounded-lg"></div>

                      {subItem.icon && iconMap[subItem.icon] && (
                        <span
                          className={`text-[15px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 group-hover:scale-110 group-hover:translate-x-1 ${location.pathname === subItem.path
                            ? "text-brand-gold"
                            : "text-gray-500 group-hover:text-brand-gold/80"
                            }`}
                        >
                          {React.createElement(iconMap[subItem.icon])}
                        </span>
                      )}
                      <span className="font-medium whitespace-nowrap relative z-10 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">{subItem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* LOGOUT */}
      <div className="p-4 mt-auto border-t border-white/5 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 active:translate-y-0 border border-red-500/30 text-red-400 hover:text-red-300 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <FaSignOutAlt className="transition-transform duration-300 group-hover:-translate-x-1" />
          Log Out
        </button>
      </div>

    </div>
  );
};

export default Header;

