import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import { getBatchHistoryApi } from "../../ApiService/Adminapi";

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [showNoData, setShowNoData] = useState(false);
  const [loading, setLoading] = useState(false);

  const [batchDetails, setBatchDetails] = useState(null);
  const [trades, setTrades] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

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
    }
  };

  

   useEffect(() => {
      const delay = setTimeout(() => {
        if (batchId) fetchBatch();
      }, 200);
      const timer = setTimeout(() => {
        setShowNoData(true);
      }, 1000);
      return () => {
        clearTimeout(delay);
        clearTimeout(timer);
      };
    }, [batchId, page]);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);

      if (page > 4) pages.push("...");

      if (page > 3 && page < totalPages - 2) {
        pages.push(page);
      }

      if (page < totalPages - 3) pages.push("...");

      pages.push(totalPages - 1, totalPages);
    }

    return [...new Set(pages)];
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
          Batch Details ({batchDetails?.batchId})
        </h1>

        <button
          onClick={() => navigate("/batchhistory")}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
        >
          ← Back
        </button>
      </div>

      {/* STATS */}
      {batchDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Trades", key: "totalTrades" },
            { label: "Open Trades", key: "openTrades" },
            { label: "Closed Trades", key: "closedTrades" },
            { label: "Total PnL", key: "totalPnl" },
          ].map((item, i) => (
            <div key={i} className="bg-[#1e293b] p-3 rounded text-center border border-gray-700">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-semibold">
                {item.key === "totalPnl"
                  ? batchDetails.stats[item.key]?.toFixed(4)
                  : batchDetails.stats[item.key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        {/* TABLE */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 ">

          <table className="min-w-[1000px] w-full text-sm border-collapse">

            <thead className="bg-[#1e293b] text-gray-400 uppercase border-b  whitespace-nowrap border-gray-700 sticky top-0">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Pair</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Leverage</th>
                <th className="px-3 py-2">Entry</th>
                <th className="px-3 py-2">Exit</th>
                <th className="px-3 py-2">PnL</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {trades.length > 0 ? (
                trades.map((t, i) => (
                  <tr
                    key={t._id}
                    className="text-center font-semibold  whitespace-nowrap hover:bg-[#1e293b]"
                  >
                    <td className="px-3 py-3 border border-gray-700">
                      {(page - 1) * limit + i + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.userId}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.pair}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.mode}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.amount}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.leverage}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.entryPrice || "-"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.exitPrice || "-"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.pnl?.toFixed(2)}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <span className={`px-2 py-1 text-xs rounded text-white ${t.status === "OPEN"
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
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

          {/* PAGINATION LOADER */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">

              {/* <div className="w-8 h-8 border-4 border-[#d6a210] border-t-transparent rounded-full animate-spin"></div> */}
              <Loader />
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2 flex-wrap">

              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-600 rounded-md disabled:opacity-40"
              >
                ‹
              </button>

              {getPageNumbers().map((num, i) =>
                num === "..." ? (
                  <span key={i}>...</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => handlePageChange(num)}
                    className={`px-2 ${page === num
                      ? "text-[#d6a210]"
                      : "text-gray-300 hover:text-[#d3b769]"
                      }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-600 rounded-md disabled:opacity-40"
              >
                ›
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BatchDetails;