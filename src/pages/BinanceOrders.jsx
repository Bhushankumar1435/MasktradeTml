import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllBinanceOrdersapi, getUserDashboardApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../components/ui/Loader";
import { FaArrowLeft, FaUser } from "react-icons/fa";

const PAGE_SIZE = 10;

const BinanceOrders = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userName, setUserName] = useState("");
  const [checkingUser, setCheckingUser] = useState(false);
  const [showNoData, setShowNoData] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getAllBinanceOrdersapi(page, PAGE_SIZE, userId);
      if (res?.data?.success) {
        setOrders(res?.data?.data || []);
        setTotal(res?.data?.total || 0);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch { toast.error("Server error"); }
    finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchOrders(), 200);
    return () => clearTimeout(delay);
  }, [page, userId]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) { setUserName(""); return; }
      setCheckingUser(true);
      try {
        const res = await getUserDashboardApi(userId);
        const user = res?.data?.data?.user;
        setUserName(user?.name || "User Found");
      } catch { setUserName("User not found"); }
      finally { setCheckingUser(false); }
    };
    fetchUser();
  }, [userId]);

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
    <div className="w-full h-full min-h-screen flex flex-col font-outfit relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
              <FaUser className="text-brand-gold text-xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
                Binance Orders
              </h1>
              <p className="text-gray-400 text-sm mt-1">Total: {total} orders</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all">
            <FaArrowLeft className="text-xs" /> Back
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
          <span className="text-gray-400">User ID: <span className="text-brand-gold font-semibold font-mono break-all">{userId}</span></span>
          <span className="text-gray-400">Name: <span className="text-white font-semibold">{checkingUser ? "Loading..." : userName}</span></span>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[900px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Pair</th>
                <th>Entry</th>
                <th>Current</th>
                <th className="text-center">PNL</th>
                <th className="text-center">PNL %</th>
                <th>QTY</th>
                <th>Used USDT</th>
                <th>Type</th>
                <th>Action</th>
                <th className="text-center">Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o, i) => (
                  <tr key={i}>
                    <td><span className="text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</span></td>
                    <td className="font-mono text-xs text-gray-400">{o.orderId}</td>
                    <td className="font-mono font-medium text-white">{o.pair}</td>
                    <td className={o.side === "BUY" ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{o.entryPrice}</td>
                    <td className="text-gray-300">{o.currentPrice}</td>
                    <td className={`text-center font-bold ${o.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{o.pnl.toFixed(2)}</td>
                    <td className={`text-center font-bold ${o.pnlPercent < 0 ? "text-red-400" : "text-green-400"}`}>{o.pnlPercent}%</td>
                    <td className="text-gray-300">{o.quantity}</td>
                    <td className="font-semibold text-brand-gold">{o.usedUSDT}</td>
                    <td className="text-gray-400">{o.orderType}</td>
                    <td className="text-gray-400">{o.tradeAction}</td>
                    <td className="text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{o.status}</span>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(o.time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="13" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="13" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default BinanceOrders;