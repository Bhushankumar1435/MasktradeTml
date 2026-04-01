import React, { useEffect, useState } from "react";
import { getTradeHistoryApi } from "../../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const CloseTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ✅ FETCH CLOSED TRADES
  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await getTradeHistoryApi(
        page,
        PAGE_SIZE,
        userId.trim(),
        "CLOSED"
      );

      if (res?.data?.success) {
        setTrades(res?.data?.data?.trades || []);
        setTotal(res?.data?.data?.pagination?.total || 0);
      } else {
        toast.error("Failed to fetch trades");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, userId]);

  // ✅ SAME PAGINATION LOGIC
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      <ToastContainer />

      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <h1 className="text-lg md:text-xl font-semibold text-white">
          Closed Trades ({trades.length})
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-3 py-2 rounded bg-[#020817] border border-gray-700 text-white text-sm"
          />

          {/* <button
            onClick={() => {
              setPage(1);
              fetchTrades();
            }}
            className="px-4 py-2 bg-blue-500 rounded text-white text-sm"
          >
            Search
          </button> */}
        </div>
      </div>

      <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        {/* ✅ SAME LOADER */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">

          <table className="min-w-[900px] w-full text-sm border-collapse">

            {/* ✅ SAME HEADER */}
            <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 border-r border-gray-700">#</th>
                <th className="px-3 py-2 border-r border-gray-700">User ID</th>
                <th className="px-3 py-2 border-r border-gray-700">Pair</th>
                <th className="px-3 py-2 border-r border-gray-700">Percentage</th>
                <th className="px-3 py-2 border-r border-gray-700">Amount</th>
                <th className="px-3 py-2 border-r border-gray-700">Leverage</th>
                <th className="px-3 py-2 border-r border-gray-700">Entry</th>
                <th className="px-3 py-2 border-r border-gray-700">Exit</th>
                <th className="px-3 py-2 border-r border-gray-700">PnL</th>
                <th className="px-3 py-2 border-r border-gray-700">Mode</th>
                <th className="px-3 py-2 border-r border-gray-700">Status</th>
                <th className="px-3 py-2 border-r border-gray-700">Date</th>
              </tr>
            </thead>

            <tbody>
              {trades.length > 0 ? (
                trades.map((t, i) => (
                  <tr
                    key={t._id}
                    className="hover:bg-[#1e293b] font-semibold transition text-center"
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
                      {t.exitPrice}
                    </td>

                    <td className={`px-3 py-3 border border-gray-700 ${
                      t.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {(t.pnl || 0).toFixed(2)}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          t.mode === "LONG"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {t.mode}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                        {t.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="12" className="text-center py-6 text-gray-500">
                      No closed trades
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>

        {/* ✅ SAME PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3">
            <span>
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2 flex-wrap items-center">
              <button disabled={page === 1} onClick={() => setPage(1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">First</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Prev</button>

              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setPage(num)} className={`px-3 py-1.5 rounded-lg ${page === num ? "bg-blue-500 text-white" : "bg-[#1e293b]"}`}>
                  {num}
                </button>
              ))}

              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Next</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Last</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CloseTrades;