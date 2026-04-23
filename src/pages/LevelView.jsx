import React, { useState, useCallback, useRef } from "react";
import { getUserLevelViewApi, getTreeChildrenApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import {
  FaSearch, FaTable, FaSitemap, FaUser,
  FaCircleNotch
} from "react-icons/fa";
import Loader from "../components/ui/Loader";
import PaginationLimit from "../components/ui/PaginationLimit";
import "./LevelView.css";

const PanZoomContext = React.createContext(null);

/* ─── Pan & Zoom Canvas Wrapper ─────────────────────────────────── */
const PanZoomCanvas = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const panToElement = useCallback((elementDOM) => {
    if (!containerRef.current || !elementDOM) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = elementDOM.getBoundingClientRect();
    
    // We want the clicked element to be centered horizontally, and positioned near the top of the canvas
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const targetY = containerRect.top + 150; // 150px from the top of the canvas
    
    const elCenterX = elRect.left + elRect.width / 2;
    const elTopY = elRect.top;
    
    const diffX = containerCenterX - elCenterX;
    const diffY = targetY - elTopY;
    
    // Because CSS transform applies translate before scale, we divide visual difference by scale
    setPosition(prev => ({
      x: prev.x + (diffX / scale),
      y: prev.y + (diffY / scale)
    }));
  }, [scale]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    // Only zoom if hovering over the canvas
    const zoomSensitivity = 0.002;
    const newScale = scale - e.deltaY * zoomSensitivity;
    setScale(Math.min(Math.max(0.3, newScale), 3)); // Increased min scale so it doesn't get too tiny
  };

  return (
    <PanZoomContext.Provider value={{ panToElement }}>
      <div 
        ref={containerRef}
        className="relative w-full h-[600px] bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl group"
      >
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50 opacity-50 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setScale(s => Math.min(s + 0.2, 3))}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-bold border border-white/10 transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s - 0.2, 0.3))}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-bold border border-white/10 transition-colors"
            title="Zoom Out"
          >
            −
          </button>
          <button 
            onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
            className="w-8 h-8 flex items-center justify-center bg-brand-gold/20 hover:bg-brand-gold/40 backdrop-blur-md rounded-lg text-brand-gold text-xs font-bold border border-brand-gold/30 transition-colors mt-2"
            title="Reset View"
          >
            R
          </button>
        </div>

        <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-50">
          <p className="text-white text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
            Drag to pan • Scroll to zoom
          </p>
        </div>

        {/* Draggable Canvas */}
        <div 
          className={`w-full h-full relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="absolute left-1/2 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ 
              transform: `translate(calc(-50% + ${position.x}px), ${position.y + 60}px) scale(${scale})`,
              width: "max-content",
              transformOrigin: "top center"
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </PanZoomContext.Provider>
  );
};

/* ─── Single Tree Node matching Image ───────────────────────────── */
const TreeNode = ({ userId, name, status, hasChildren }) => {
  const [children, setChildren] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { panToElement } = React.useContext(PanZoomContext) || {};
  const cardRef = useRef(null);

  const isActive = status === "ACTIVE";

  const handleClick = async (e) => {
    e.stopPropagation(); // prevent drag from firing click if we implemented strict drag detection
    
    if (!hasChildren) return;

    if (expanded) {
      setExpanded(false);
      return;
    }

    if (children.length === 0) {
      setLoading(true);
      try {
        const res = await getTreeChildrenApi(userId);
        const data = res?.data?.data || [];
        
        // SORTING: Active users placed together (left side), Inactive on right
        const sortedData = [...data].sort((a, b) => {
          if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
          if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
          return 0; // maintain original order if both same
        });

        setChildren(sortedData);
      } catch {
        toast.error("Failed to load children for " + userId);
      } finally {
        setLoading(false);
      }
    }

    setExpanded(true);
    
    // Smooth auto-pan to newly opened node
    if (panToElement && cardRef.current) {
      setTimeout(() => {
        panToElement(cardRef.current);
      }, 100); // slight delay to allow CSS animation to begin
    }
  };

  return (
    <li>
      <div className="node-content flex flex-col items-center">
        {/* Glassmorphic Card */}
        <div 
          ref={cardRef}
          onClick={handleClick}
          className={`relative z-10 flex flex-col items-center gap-2 p-3 rounded-2xl border backdrop-blur-md transition-all duration-300
            ${hasChildren ? "cursor-pointer hover:-translate-y-1" : "cursor-default opacity-90"}
            ${isActive
              ? "bg-emerald-950/40 border-emerald-500/30 shadow-[0_4px_20px_rgba(52,211,153,0.15)] hover:shadow-[0_8px_30px_rgba(52,211,153,0.25)] hover:border-emerald-400/50"
              : "bg-red-950/40 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.25)] hover:border-red-400/50"
            }`}
          style={{ minWidth: "140px", maxWidth: "160px" }}
          title={hasChildren ? "Click to expand" : "No downline"}
        >
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner
            ${isActive ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-red-400 bg-red-500/20 text-red-300"}`}>
            {loading ? <FaCircleNotch className="animate-spin text-lg" /> : <FaUser className="text-lg" />}
          </div>

          {/* Info */}
          <div className="text-center w-full">
            <p className="text-white text-xs font-bold uppercase tracking-wider truncate w-[110px] mx-auto">{name || "Unknown"}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" : "bg-red-500"}`}></span>
              <span className="text-gray-300 text-[10px] font-mono tracking-widest">{userId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Children inside nested UL for CSS rules to map correctly */}
      {expanded && children.length > 0 && (
        <ul className="tree-node-animate">
          {children.map(child => (
            <TreeNode
              key={child.userId}
              userId={child.userId}
              name={child.name}
              status={child.status}
              hasChildren={child.hasChildren}
            />
          ))}
        </ul>
      )}
    </li>
  );
};


/* ─── Main Level View Page ──────────────────────────────────────── */
const LevelView = () => {
  const [searchId, setSearchId] = useState("");
  const [activeSearchId, setActiveSearchId] = useState("");
  const [levelStats, setLevelStats] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [treeChildren, setTreeChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLevelData = async (id, page, currentLimit) => {
    try {
      setLoading(true);
      const res = await getUserLevelViewApi(id, page, currentLimit);
      const responseData = res?.data?.data || [];
      setLevelStats(responseData);
      setTotalPages(res?.data?.pagination?.totalPages || res?.data?.totalPages || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch user level view");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return toast.error("Please enter a User ID");
    
    setActiveSearchId(searchId.trim());
    setCurrentPage(1);
    setLevelStats([]);
    setTreeData(null);
    setTreeChildren([]);
    
    fetchLevelData(searchId.trim(), 1, limit);
  };

  React.useEffect(() => {
    if (activeSearchId) {
      fetchLevelData(activeSearchId, currentPage, limit);
    }
  }, [currentPage, limit]);

  const handleLoadTree = useCallback(async () => {
    if (!searchId.trim()) return;
    setTreeLoading(true);
    setTreeData(null);
    setTreeChildren([]);
    try {
      const res = await getTreeChildrenApi(searchId.trim());
      setTreeData(res?.data?.clickedUser || null);
      
      const childrenData = res?.data?.data || [];
      // SORTING root children
      const sortedChildren = [...childrenData].sort((a, b) => {
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
        if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
        return 0;
      });

      setTreeChildren(sortedChildren);
    } catch {
      toast.error("Failed to load tree for this user");
    } finally {
      setTreeLoading(false);
    }
  }, [searchId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "tree" && !treeData && activeSearchId) {
      handleLoadTree();
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <div className="w-full min-h-screen flex flex-col font-poppins relative pb-20">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full" />

      {/* ── Search Header ── */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl mx-4 mt-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            Level View & Network Tree
          </h1>
          <p className="text-gray-400 text-sm mt-1">Search a User ID to explore their network</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Enter User ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-gold text-black font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition text-sm whitespace-nowrap"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {/* ── Tabs ── */}
      {(levelStats.length > 0) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 relative z-10 mb-4 w-full">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleTabChange("table")}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition
                ${activeTab === "table"
                  ? "bg-brand-gold text-black shadow-[0_0_15px_rgba(214,162,16,0.3)]"
                  : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              <FaTable /> Level Stats
            </button>
            <button
              onClick={() => handleTabChange("tree")}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition
                ${activeTab === "tree"
                  ? "bg-brand-gold text-black shadow-[0_0_15px_rgba(214,162,16,0.3)]"
                  : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              <FaSitemap /> Network Tree
            </button>
          </div>

          {/* Rows Per Page Dropdown */}
          {activeTab === "table" && (
            <div className="w-full sm:w-auto flex justify-end">
              <PaginationLimit value={limit} onChange={(val) => { setLimit(val); setCurrentPage(1); }} />
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 px-4 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader /></div>

        ) : activeTab === "table" && levelStats.length > 0 ? (
          <div className="glass-table-container">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px] glass-table whitespace-nowrap text-center">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Level</th>
                    <th>Total Team</th>
                    <th>Active</th>
                    <th>Inactive</th>
                    <th>Team Business</th>
                  </tr>
                </thead>
                <tbody>
                  {levelStats.map((item, idx) => (
                    <tr key={idx}>
                      <td><span className="text-gray-500 font-medium">{(currentPage - 1) * limit + idx + 1}</span></td>
                      <td className="font-bold text-brand-gold text-base">{item.level}</td>
                      <td className="text-gray-300 font-medium">{item.totalTeam}</td>
                      <td className="text-emerald-400 font-semibold">{item.activeTeam}</td>
                      <td className="text-red-400 font-semibold">{item.inactiveTeam}</td>
                      <td className="text-yellow-300 font-bold">${item.teamBusiness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md text-sm gap-3 mt-4 rounded-xl">
              <span className="text-gray-400 font-medium">
                Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40"
                >
                  Prev
                </button>
                {getPageNumbers().map((num, index) =>
                  num === "..." ? (
                    <span key={index} className="px-0.5 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(num)}
                      className={`px-0.5 py-0.5 font-semibold transition-all ${
                        currentPage === num ? "text-brand-gold" : "text-gray-400 hover:text-brand-gold"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  disabled={currentPage >= totalPages || levelStats.length < limit}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        ) : activeTab === "tree" ? (
          <div className="w-full">
            {treeLoading ? (
              <div className="flex items-center justify-center h-48 glass-panel rounded-2xl"><Loader /></div>
            ) : treeData ? (
              
              <PanZoomCanvas>
                <div className="org-tree">
                  <ul>
                    {/* Root Node using TreeNode directly so it starts collapsed and matches card style */}
                    <TreeNode
                      userId={treeData.userId}
                      name={treeData.name}
                      status={treeData.status}
                      hasChildren={treeChildren.length > 0}
                    />
                  </ul>
                </div>
              </PanZoomCanvas>

            ) : (
              <div className="flex items-center justify-center h-48 glass-panel rounded-2xl text-gray-500 font-medium text-sm">
                Click "Network Tree" tab to load the tree for this user
              </div>
            )}
          </div>

        ) : !loading && (
          <div className="flex items-center justify-center h-64 text-gray-500 font-medium text-sm">
            Enter a User ID and press Search to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelView;
