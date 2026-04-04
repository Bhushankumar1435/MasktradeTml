import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import headerjson from "../../json/Header.json";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { adminLogoutApi } from "../../ApiService/Adminapi";
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
  FaRandom
} from "react-icons/fa";

const Header = ({ closeSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const iconMap = {
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
    FaRandom
  };

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
    <div className="h-[100dvh] w-[250px] min-w-[250px] bg-[#0f172a] text-white flex flex-col">

      <div
        onClick={() => closeSidebar?.()}
        className="p-5 border-b border-gray-700 cursor-pointer md:cursor-default"
      >
        <h1 className="text-xl md:text-2xl text-[#d6a210] font-semibold">
          Admin Panel
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">

        {headerjson.map((item, index) => {
          const isParentActive = item.children
            ? item.children.some((sub) => location.pathname === sub.path)
            : location.pathname === item.path;

          return (
            <div key={index}>

              {/* MAIN MENU */}
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
                  className={`relative px-4 py-2 rounded-lg flex justify-between items-center transition group overflow-hidden
               ${isParentActive
                      ? "bg-gradient-to-r from-[#d6a210] to-[#d3b769] hover:scale-[1.01] transition text-white"
                      : "hover:bg-white/10 text-gray-300"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon && iconMap[item.icon] && (
                      <span
                        className={`text-lg ${isParentActive ? "text-white" : "text-[#d6a210]"
                          }`}
                      >
                        {React.createElement(iconMap[item.icon])}
                      </span>
                    )}
                    <span className="font-medium">{item.title}</span>
                  </span>

                  {item.children && (
                    <span className="text-sm ">
                      {openMenu === index ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  )}

                  {/*  SMOOTH ANIMATION LINE */}
                  <span
                    className={`absolute left-0 bottom-0 h-[2px] bg-[#d6a210] transition-all duration-300
              ${isParentActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  ></span>
                </NavLink>

              </div>

              {/* SUB MENU */}
              {item.children && openMenu === index && (
                <div className="ml-4 mt-2 flex flex-col gap-1">

                  {item.children.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      onClick={() => closeSidebar?.()}
                      className={({ isActive }) =>
                        `relative px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition group overflow-hidden
                        ${isActive
                          ? "bg-gradient-to-r from-[#d6a210] to-[#d3b769] hover:scale-[1.01] transition text-white"
                          : "text-gray-400 hover:bg-white/10"
                        }`
                      }
                    >
                      {subItem.icon && iconMap[subItem.icon] && (
                        <span
                          className={`text-sm ${location.pathname === subItem.path
                              ? "text-white"
                              : "text-[#d6a210]"
                            }`}
                        >
                          {React.createElement(iconMap[subItem.icon])}
                        </span>
                      )}
                      <span>{subItem.title}</span>

                      {/* BOTTOM LINE */}
                      <span
                        className={`absolute left-0 bottom-0 h-[2px] bg-[#d6a210] transition-all duration-300
                       ${location.pathname === subItem.path ? "w-full" : "w-0 group-hover:w-full"}`}
                      ></span>
                    </NavLink>
                  ))}

                </div>
              )}

            </div>
          );
        })}

      </div>
      {/* LOGOUT */}
      <div className="p-4 mb-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-700 py-2 font-semibold rounded-lg transition"
        >
          Log Out
        </button>
      </div>

    </div>
  );
};

export default Header;