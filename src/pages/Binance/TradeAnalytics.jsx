import React, { useEffect, useState, useRef, useCallback } from "react";
import { getMyProfitHistoryAllApi, getMyProfitHistoryApi } from "../../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/ui/Loader";
import { FaChartLine, FaFilter, FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import PaginationLimit from "../../components/ui/PaginationLimit";

// ─── Pure SVG Sparkline Chart ────────────────────────────────────────────────
const PnLChart = ({ chartData, selectedUser }) => {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        No chart data available
      </div>
    );
  }

  const W = 900;
  const H = 300;
  const PAD = { top: 30, right: 30, bottom: 50, left: 70 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Build cumulative PnL per date point
  const points = chartData.map((d, i) => ({
    index: i,
    label: d.label,
    pnl: d.pnl,
    cumPnl: d.cumPnl,
    type: d.type,
  }));

  const cumValues = points.map((p) => p.cumPnl);
  const minVal = Math.min(0, ...cumValues);
  const maxVal = Math.max(0, ...cumValues);
  const range = maxVal - minVal || 1;

  const xScale = (i) => PAD.left + (i / Math.max(points.length - 1, 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - ((v - minVal) / range) * innerH;
  const zeroY = yScale(0);

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.cumPnl)}`)
    .join(" ");

  // Fill area
  const areaPath =
    linePath +
    ` L ${xScale(points.length - 1)} ${zeroY} L ${xScale(0)} ${zeroY} Z`;

  // Determine dominant color
  const lastCum = cumValues[cumValues.length - 1] ?? 0;
  const lineColor = lastCum >= 0 ? "#22c55e" : "#ef4444";
  const fillColor = lastCum >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)";

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (range / 4) * i).concat([maxVal]);
  const uniqueYTicks = [...new Set(yTicks.map((v) => parseFloat(v.toFixed(2))))];

  // X-axis ticks (show every nth label)
  const step = Math.max(1, Math.floor(points.length / 8));
  const xTicks = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const relX = x - PAD.left;
    const idx = Math.round((relX / innerW) * (points.length - 1));
    if (idx >= 0 && idx < points.length) {
      const p = points[idx];
      setTooltip({
        x: xScale(idx),
        y: yScale(p.cumPnl),
        label: p.label,
        pnl: p.pnl,
        cumPnl: p.cumPnl,
        type: p.type,
      });
    }
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ minHeight: "220px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {uniqueYTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={yScale(tick)}
              x2={W - PAD.right}
              y2={yScale(tick)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4"
            />
            <text
              x={PAD.left - 8}
              y={yScale(tick) + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(255,255,255,0.45)"
            >
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Zero line */}
        <line
          x1={PAD.left}
          y1={zeroY}
          x2={W - PAD.right}
          y2={zeroY}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* X axis ticks */}
        {xTicks.map((p, i) => (
          <text
            key={i}
            x={xScale(p.index)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.35)"
          >
            {p.label.length > 8 ? p.label.slice(0, 8) : p.label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots at each point */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p.cumPnl)}
            r={tooltip?.label === p.label ? 5 : 2.5}
            fill={p.pnl >= 0 ? "#22c55e" : "#ef4444"}
            stroke={p.pnl >= 0 ? "#16a34a" : "#dc2626"}
            strokeWidth="1"
          />
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x}
              y1={PAD.top}
              x2={tooltip.x}
              y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="3"
              strokeWidth="1"
            />
            {/* Tooltip Box */}
            <foreignObject
              x={tooltip.x > W / 2 ? tooltip.x - 150 : tooltip.x + 10}
              y={Math.max(PAD.top, tooltip.y - 60)}
              width="140"
              height="80"
              style={{ overflow: "visible" }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  background: "rgba(2,8,23,0.92)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  fontSize: "11px",
                  color: "white",
                  backdropFilter: "blur(8px)",
                  width: "140px",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  {tooltip.label}
                </div>
                <div
                  style={{
                    color: tooltip.pnl >= 0 ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  PnL: {tooltip.pnl >= 0 ? "+" : ""}
                  {tooltip.pnl.toFixed(4)}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  Cum: {tooltip.cumPnl >= 0 ? "+" : ""}
                  {tooltip.cumPnl.toFixed(4)}
                </div>
              </div>
            </foreignObject>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Profit
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Loss
        </span>
        <span className="flex items-center gap-1">
          <span className="w-8 h-[2px] bg-white/30 inline-block align-middle" />
          Cumulative PnL Line
        </span>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TradeAnalytics = () => {
  // Chart state
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartSearch, setChartSearch] = useState("");
  const [chartType, setChartType] = useState("");
  const [chartDebounce, setChartDebounce] = useState("");

  // Summary stats
  const [stats, setStats] = useState({
    totalPnl: 0,
    totalProfit: 0,
    totalLoss: 0,
    totalTrades: 0,
    profitCount: 0,
    lossCount: 0,
  });

  // Table state
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [showNoData, setShowNoData] = useState(false);

  const totalPages = Math.ceil(total / limit);

  // ── Fetch chart data (all records, no pagination) ──────────────────────────
  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await getMyProfitHistoryAllApi(1000, chartDebounce, chartType);
      if (res?.data?.success) {
        const raw = Array.isArray(res.data.data) ? res.data.data : [];

        // Sort ascending by date
        const sorted = [...raw].sort(
          (a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
        );

        // Build chart points with cumulative PnL
        let cum = 0;
        let totalP = 0,
          totalL = 0,
          profCnt = 0,
          lossCnt = 0;

        const pts = sorted.map((item) => {
          // ✅ Exact PnL from backend — no recalculation
          const pnl = typeof item.pnl === "number" ? item.pnl : parseFloat(item.pnl) || 0;
          cum += pnl;
          if (pnl >= 0) { totalP += pnl; profCnt++; }
          else { totalL += pnl; lossCnt++; }
          return {
            label: `${item.date || ""} ${item.time ? item.time.slice(0, 5) : ""}`.trim(),
            pnl,
            cumPnl: parseFloat(cum.toFixed(6)),
            type: item.type,
            pair: item.pair,
          };
        });

        setChartData(pts);
        setStats({
          totalPnl: cum,
          totalProfit: totalP,
          totalLoss: totalL,
          totalTrades: sorted.length,
          profitCount: profCnt,
          lossCount: lossCnt,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load chart data");
    } finally {
      setChartLoading(false);
    }
  }, [chartDebounce, chartType]);

  // ── Fetch table data (paginated) ───────────────────────────────────────────
  const fetchTableData = useCallback(async () => {
    setTableLoading(true);
    setShowNoData(false);
    try {
      const res = await getMyProfitHistoryApi(page, limit, search, type);
      if (res?.data?.success) {
        setTableData(Array.isArray(res.data.data) ? res.data.data : []);
        setTotal(res.data.total || 0);
      } else {
        toast.error("Failed to fetch trade records");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setTableLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  }, [page, limit, search, type]);

  // Chart debounce
  useEffect(() => {
    const t = setTimeout(() => setChartDebounce(chartSearch), 500);
    return () => clearTimeout(t);
  }, [chartSearch]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    const t = setTimeout(() => fetchTableData(), 200);
    return () => clearTimeout(t);
  }, [fetchTableData]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push("...");
      if (page > 3 && page < totalPages - 2) pages.push(page);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const typeFilters = [
    { label: "All", value: "" },
    { label: "Profit", value: "PROFIT" },
    { label: "Loss", value: "LOSS" },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col font-poppins relative overflow-hidden gap-6">
      <ToastContainer />

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-brand-gold/8 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-blue-900/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-brand-gold/30 rounded-xl bg-brand-gold/10 shadow-glow-gold/20">
            <FaChartLine className="text-brand-gold text-2xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-300">
              Trade Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              PnL Graph + All Trade Records — Exact Backend Values
            </p>
          </div>
        </div>

        {/* Chart-level search by userId/token */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              placeholder="Filter by User ID..."
              value={chartSearch}
              onChange={(e) => {
                setChartSearch(e.target.value);
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 transition w-52"
            />
          </div>
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setChartType(f.value);
                setType(f.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                chartType === f.value
                  ? f.value === "PROFIT"
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : f.value === "LOSS"
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-brand-gold/20 border-brand-gold/40 text-brand-gold"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS CARDS ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: "Total PnL",
            value: `${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(4)}`,
            color: stats.totalPnl >= 0 ? "text-green-400" : "text-red-400",
            border: stats.totalPnl >= 0 ? "border-green-500/20" : "border-red-500/20",
            icon: <FaWallet />,
          },
          {
            label: "Total Profit",
            value: `+${stats.totalProfit.toFixed(4)}`,
            color: "text-green-400",
            border: "border-green-500/20",
            icon: <FaArrowUp />,
          },
          {
            label: "Total Loss",
            value: `${stats.totalLoss.toFixed(4)}`,
            color: "text-red-400",
            border: "border-red-500/20",
            icon: <FaArrowDown />,
          },
          {
            label: "Total Trades",
            value: stats.totalTrades,
            color: "text-white",
            border: "border-white/10",
            icon: <FaChartLine />,
          },
          {
            label: "Profit Trades",
            value: stats.profitCount,
            color: "text-green-400",
            border: "border-green-500/20",
            icon: <FaArrowUp />,
          },
          {
            label: "Loss Trades",
            value: stats.lossCount,
            color: "text-red-400",
            border: "border-red-500/20",
            icon: <FaArrowDown />,
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`glass-panel p-4 rounded-xl border ${s.border} flex flex-col gap-1 hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className={`text-sm ${s.color} opacity-70`}>{s.label}</div>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── PnL CHART ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FaChartLine className="text-brand-gold" />
            Cumulative PnL Graph
            {chartSearch && (
              <span className="text-xs text-brand-gold/60 font-normal ml-2">
                — {chartSearch}
              </span>
            )}
          </h2>
          <span className="text-xs text-gray-500">{chartData.length} data points</span>
        </div>

        {chartLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader />
          </div>
        ) : (
          <PnLChart chartData={chartData} selectedUser={chartSearch} />
        )}
      </div>

      {/* ── TRADES TABLE ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 glass-panel rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">
            All Trades — PnL (Exact from Backend)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">Total: {total}</span>
            <PaginationLimit
              value={limit}
              onChange={(val) => { setLimit(val); setPage(1); }}
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[900px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Pair</th>
                <th className="text-center">Type</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
                <th className="text-center">PnL (Exact)</th>
                <th>Fee</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item, i) => {
                  // ✅ Exact PnL — never recalculated, direct from backend
                  const pnl = typeof item.pnl === "number" ? item.pnl : parseFloat(item.pnl) || 0;
                  return (
                    <tr key={i}>
                      <td>
                        <span className="text-gray-500">{(page - 1) * limit + i + 1}</span>
                      </td>
                      <td className="font-medium text-white">{item.userId}</td>
                      <td className="font-mono text-gray-300">{item.pair}</td>
                      <td className="text-center">
                        <span
                          className={`glass-badge ${
                            item.type === "PROFIT"
                              ? "glass-badge-success"
                              : "glass-badge-danger"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="text-gray-300">{item.side}</td>
                      <td className="text-gray-300">{item.qty}</td>
                      <td className="text-gray-300">{item.price}</td>
                      <td className={`text-center font-bold font-mono text-sm ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl >= 0 ? "+" : ""}
                        {pnl.toFixed(6)}
                      </td>
                      <td className="text-gray-400">{item.commission}</td>
                      <td className="text-gray-500 text-xs">{`${item.date} ${item.time}`}</td>
                    </tr>
                  );
                })
              ) : tableLoading || !showNoData ? (
                <tr>
                  <td colSpan="10" className="text-center py-12">
                    <span className="opacity-0">Loading...</span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-gray-500 font-medium">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {tableLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 backdrop-blur-md z-20">
              <Loader />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md text-sm gap-3">
          <span className="text-gray-400 font-medium">
            Page <span className="text-white">{page}</span> of{" "}
            <span className="text-white">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
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
                  onClick={() => handlePageChange(num)}
                  className={`px-0.5 py-0.5 font-semibold transition-all ${
                    page === num ? "text-brand-gold" : "text-gray-400 hover:text-brand-gold"
                  }`}
                >
                  {num}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeAnalytics;
