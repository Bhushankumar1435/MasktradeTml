import React, { useEffect, useState } from "react";
import { getTradeHistoryApi, closeTradeApi } from "../../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/ui/Loader";

const PAGE_SIZE = 10;

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await getTradeHistoryApi(
        page,
        PAGE_SIZE,
        userId.trim(),
        ""
      );

      if (res?.data?.success) {
        const tradeData = res?.data?.data?.trades || [];
        setTrades(tradeData);
        setTotal(res?.data?.data?.pagination?.total || 0);
      } else {
        toast.error(res?.data?.message || "Failed to fetch trades");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId) => {
    try {
      setLoading(true);
      setShowNoData(false);

      const res = await closeTradeApi(tradeId);

      if (res?.data?.success) {
        toast.success("Trade closed successfully");
        fetchTrades();
      } else {
        toast.error(res?.data?.message || "Failed to close trade");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  ////////////////// BINANCE //////////////////

  const fetchPrice = async (pair) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`
      );
      const data = await res.json();
      return parseFloat(data.price);
    } catch {
      return null;
    }
  };

  const updatePrices = async () => {
    if (!trades.length) return;

    const activeTrades = trades.filter(t => t.status !== "CLOSED");
    const uniquePairs = [...new Set(activeTrades.map(t => t.pair))];

    const updated = {};

    await Promise.all(
      uniquePairs.map(async (pair) => {
        const price = await fetchPrice(pair);
        if (price) updated[pair] = price;
      })
    );

    setPrices(prev => {
      const changed = Object.keys(updated).some(
        key => prev[key] !== updated[key]
      );
      return changed ? updated : prev;
    });
  };

  const calculatePnL = (trade) => {
    if (trade.status === "CLOSED") {
      return trade.pnl || 0;
    }

    const current = prices[trade.pair];
    if (!current) return 0;

    return trade.mode === "LONG"
      ? (current - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - current) * trade.quantity;
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTrades();
    }, 200);
    const timer = setTimeout(() => {
      setShowNoData(true);
    }, 1000);
    return () => {
      clearTimeout(delay);
      clearTimeout(timer);
    };
  }, [page, userId]);

  useEffect(() => {
    let interval;

    const hasActiveTrades = trades.some(t => t.status !== "CLOSED");

    if (hasActiveTrades) {
      updatePrices();

      interval = setInterval(() => {
        updatePrices();
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [trades]);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (page > 4) {
        pages.push("...");
      }
      if (page > 3 && page < totalPages - 2) {
        pages.push(page);
      }
      if (page < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      <ToastContainer />



      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-4 ">
          <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
          <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
            Trade History ({total})
          </h1>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-3 py-2 rounded bg-[#020817] border border-gray-700 text-white text-sm"
          />

          {/* <button
            onClick={() => setPage(1)}
            className="px-4 py-2 bg-blue-500 rounded text-white text-sm"
          >
            Search
          </button> */}
        </div>

      </div>

      <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 ">


          <table className="min-w-[900px] w-full text-sm border-collapse">

            <thead className="bg-gradient-to-r from-[#d6a210] to-[#d4b55e] text-white text-sm whitespace-nowrap uppercase sticky top-0 border-b border-[#d6a210]">
              <tr>
                <th className="px-3 py-2 ">#</th>
                <th className="px-3 py-2 ">User ID</th>
                <th className="px-3 py-2 ">Pair</th>
                <th className="px-3 py-2 ">Percentage</th>
                <th className="px-3 py-2 ">Amount</th>
                <th className="px-3 py-2 ">Leverage</th>
                <th className="px-3 py-2 ">Entry</th>
                <th className="px-3 py-2 ">Current</th>
                <th className="px-3 py-2 ">PnL</th>
                <th className="px-3 py-2 ">Mode</th>
                <th className="px-3 py-2 ">Status</th>
                <th className="px-3 py-2 ">Action</th>
                <th className="px-3 py-2 ">Date</th>
              </tr>
            </thead>

            <tbody>
              {trades.length > 0 ? (

                trades.map((t, i) => {

                  const current = prices[t.pair];
                  const pnl = calculatePnL(t);

                  return (
                    <tr
                      key={t._id || i}
                      className="hover:bg-[#1e293b] font-semibold whitespace-nowrap transition text-center"
                    >
                      <td className="px-3 py-3 border border-gray-700">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.userId}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.pair}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.amount}%
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.usedUSDT}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.leverage}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.entryPrice}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.status === "CLOSED"
                          ? t.exitPrice
                          : current
                            ? current
                            : "Loading..."}
                      </td>

                      <td className={`px-3 py-3 border border-gray-700 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl.toFixed(2)}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        <span className={`px-2 py-1 text-xs rounded ${t.mode === "LONG"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"}`}>
                          {t.mode}
                        </span>
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                          {t.status || "Active"}
                        </span>
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {t.status !== "CLOSED" && (
                          <button
                            onClick={() => handleCloseTrade(t._id)}
                            className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            Close
                          </button>
                        )}
                      </td>

                      <td className="px-3 py-3 border border-gray-700">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                loading || !showNoData ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">
                    {/* <div className="w-8 h-8 border-4 border-[#d6a210] border-t-transparent rounded-full animate-spin"></div> */}
                    <Loader />
                  </div>
                ) :
                  (
                    <tr> <td colSpan="11" className="text-center py-6 text-gray-500"> No Data Found </td> </tr>
                  )
              )}
            </tbody>

          </table>
          {/* Loader */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
              {/* <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div> */}
              <Loader />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

          {/* LEFT */}
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>

          {/* RIGHT (GROUP ALL BUTTONS) */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Previous */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ‹
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className=" text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={` flex items-center justify-center rounded-md text-sm font-semibold transition ${page === num
                    ? " text-[#d6a210]"
                    : "text-gray-300 hover:text-[#d3b769]"
                    }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ›
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;