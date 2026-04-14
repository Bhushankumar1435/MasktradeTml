import React, { useEffect, useState } from "react";
import { getTradeHistoryApi } from "../../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/ui/Loader";
import { FaLockOpen } from "react-icons/fa";

const PAGE_SIZE = 10;

const CloseTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchTrades = async () => {
    setLoading(true);
    setShowNoData(false);
    try {
      const res = await getTradeHistoryApi(page, PAGE_SIZE, userId.trim(), "CLOSED");
      if (res?.data?.success) {
        setTrades(res?.data?.data?.trades || []);
        setTotal(res?.data?.data?.pagination?.total || 0);
      } else {
        toast.error("Failed to fetch trades");
      }
    } catch (err) { toast.error(err?.response?.data?.message || `Server error`); }
    finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchTrades(), 200);
    return () => clearTimeout(delay);
  }, [page, userId]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push("...");
      if (page > 3 && page < totalPages - 2) pages.push(page);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const handlePageChange = (p) => { if (p < 1 || p > totalPages) return; setPage(p); };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <ToastContainer />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-red-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-red-500/30 rounded-xl bg-red-500/10">
            <FaLockOpen className="text-red-400 text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
              Closed Trades
            </h1>
            <p className="text-gray-400 text-sm mt-1">{trades.length} trades loaded</p>
          </div>
        </div>
        <input type="text" placeholder="Search User ID" value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/40 transition w-full md:w-56"
        />
      </div>

      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[900px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Pair</th>
                <th>%</th>
                <th>Amount</th>
                <th>Leverage</th>
                <th>Entry</th>
                <th>Exit</th>
                <th className="text-center">PnL</th>
                <th className="text-center">Mode</th>
                <th className="text-center">Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.length > 0 ? (
                trades.map((t, i) => (
                  <tr key={t._id}>
                    <td><span className="text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</span></td>
                    <td className="text-white font-medium">{t.userId}</td>
                    <td className="font-mono text-gray-300">{t.pair}</td>
                    <td className="text-gray-300">{t.amount}%</td>
                    <td className="font-semibold text-brand-gold">{t.usedUSDT}</td>
                    <td className="text-gray-300">{t.leverage}x</td>
                    <td className="text-gray-300">{t.entryPrice}</td>
                    <td className="text-gray-300">{t.exitPrice}</td>
                    <td className={`text-center font-bold ${(t.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {(t.pnl || 0).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <span className={`glass-badge ${t.mode === "LONG" ? "glass-badge-success" : "glass-badge-danger"}`}>{t.mode}</span>
                    </td>
                    <td className="text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{t.status}</span>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(t.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="12" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="12" className="text-center py-12 text-gray-500 font-medium">No Closed Trades Found</td></tr>
                )
              )}
            </tbody>
          </table>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 backdrop-blur-md z-20">
              <Loader />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md text-sm gap-3">
          <span className="text-gray-400 font-medium">
            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
              className="px-3 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40">Prev</button>
            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className="px-0.5 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={`px-0.5 py-0.5  font-semibold transition-all ${page === num
                    ? "text-brand-gold "
                    : "text-gray-400  hover:brand-gold  "
                    }`}
                >
                  {num}
                </button>
              )
            )}
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
              className="px-3 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseTrades;