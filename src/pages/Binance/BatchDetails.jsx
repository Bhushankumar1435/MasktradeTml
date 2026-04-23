import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import { getBatchHistoryApi } from "../../ApiService/Adminapi";
import { FaArrowLeft, FaLayerGroup } from "react-icons/fa";

import PaginationLimit from "../../components/ui/PaginationLimit";

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [showNoData, setShowNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batchDetails, setBatchDetails] = useState(null);
  const [trades, setTrades] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [prices, setPrices] = useState({});
  const totalPages = Math.ceil(total / limit);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getBatchHistoryApi(batchId, page, limit);
      if (res.data.success) {
        setBatchDetails(res.data.data);
        setTrades(res.data.data.trades || []);
        setTotal(res.data.data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch batch details", err);
    } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  const fetchPrice = async (pair) => {
    try {
      const res = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${pair}`);
      const data = await res.json();
      return parseFloat(data.markPrice);
    } catch { return null; }
  };

  const updatePrices = async () => {
    if (!trades.length) return;
    const activeTrades = trades.filter(t => t.status !== "CLOSED");
    const uniquePairs = [...new Set(activeTrades.map(t => t.pair))];
    const updated = {};
    await Promise.all(uniquePairs.map(async (pair) => {
      const price = await fetchPrice(pair);
      if (price) updated[pair] = price;
    }));
    setPrices(prev => {
      const changed = Object.keys(updated).some(key => prev[key] !== updated[key]);
      return changed ? updated : prev;
    });
  };

  const calculatePnL = (trade) => {
    if (trade.status === "CLOSED") return trade.pnl || 0;
    const current = prices[trade.pair];
    if (!current) return 0;
    const pnl = trade.mode === "LONG"
      ? (current - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - current) * trade.quantity;
    const fee = trade.usedUSDT * 0.0004 * trade.leverage;
    return pnl - fee;
  };

  const calculateTotalPnL = () =>
    trades.reduce((total, trade) => total + calculatePnL(trade), 0);

  useEffect(() => {
    let interval;
    const hasActiveTrades = trades.some(t => t.status !== "CLOSED");
    if (hasActiveTrades) {
      updatePrices();
      interval = setInterval(updatePrices, 2000);
    }
    return () => clearInterval(interval);
  }, [trades]);

  useEffect(() => {
    const delay = setTimeout(() => { if (batchId) fetchBatch(); }, 200);
    return () => clearTimeout(delay);
  }, [batchId, page, limit]);

  const handlePageChange = (p) => { if (p < 1 || p > totalPages) return; setPage(p); };

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

  const totalPnl = calculateTotalPnL();

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaLayerGroup className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Batch Details
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-mono">{batchDetails?.batchId}</p>
          </div>
        </div>
        <button onClick={() => navigate("/batchhistory")}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all">
          <FaArrowLeft className="text-xs" /> Back to Batches
        </button>
      </div>

      {/* STATS CARDS */}
      {batchDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
          {[
            { label: "Total Trades", value: batchDetails.stats?.totalTrades, color: "text-white" },
            { label: "Open Trades", value: batchDetails.stats?.openTrades, color: "text-emerald-400" },
            { label: "Closed Trades", value: batchDetails.stats?.closedTrades, color: "text-red-400" },
            { label: "Total PnL", value: totalPnl.toFixed(2), color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl text-center hover:-translate-y-1 transition-transform cursor-default">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
            {/* Top Controls: Rows per page */}
      <div className="flex justify-end mb-4 relative z-10 px-2">
          <PaginationLimit 
              value={limit} 
              onChange={(val) => { setLimit(val); setPage(1); }} 
          />
      </div>
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[1000px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Pair</th>
                <th className="text-center">Mode</th>
                <th>%</th>
                <th>Amount</th>
                <th>Leverage</th>
                <th>Entry</th>
                <th>Current</th>
                <th className="text-center">PnL</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.length > 0 ? (
                trades.map((t, i) => {
                  const pnl = calculatePnL(t);
                  return (
                    <tr key={t._id}>
                      <td><span className="text-gray-500">{(page - 1) * limit + i + 1}</span></td>
                      <td className="text-white font-medium">{t.userId}</td>
                      <td className="font-mono text-gray-300">{t.pair}</td>
                      <td className="text-center">
                        <span className={`glass-badge ${t.mode === "LONG" ? "glass-badge-success" : "glass-badge-danger"}`}>{t.mode}</span>
                      </td>
                      <td className="text-gray-300">{t.amount}%</td>
                      <td className="font-semibold text-brand-gold">{t.usedUSDT}</td>
                      <td className="text-gray-300">{t.leverage}x</td>
                      <td className="text-gray-300">{t.entryPrice || "—"}</td>
                      <td className="text-gray-300">
                        {t.status === "CLOSED"
                          ? Number(t.exitPrice).toFixed(5)
                          : prices[t.pair]
                            ? Number(prices[t.pair]).toFixed(5)
                            : <span className="text-gray-600 text-xs animate-pulse">Loading...</span>}
                      </td>
                      <td className={`text-center font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span className={`glass-badge ${t.status === "OPEN" ? "glass-badge-success" : "glass-badge-danger"}`}>{t.status}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="11" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="11" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

        {/* PAGINATION */}
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
};

export default BatchDetails;