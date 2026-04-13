import React, { useEffect, useState } from "react";
import { getAllBatchesApi, closeTradeByBatchApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaCopy, FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllBatches = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / limit);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getAllBatchesApi(page, limit, search);
      setData(res?.data?.data || []);
      setTotal(res?.data?.pagination?.total || 0);
    } catch (err) {
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchBatches(), 200);
    return () => clearTimeout(delay);
  }, [page, search]);

  const handleCloseBatch = async (batchId) => {
    if (!window.confirm("Close all trades for this batch?")) return;
    try {
      const res = await closeTradeByBatchApi(batchId);
      if (res?.data?.success) { toast.success(res.data.message || "Batch Closed"); fetchBatches(); }
      else toast.error("Something went wrong");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Close Failed");
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

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

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-outfit relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 bg-brand-gold/10">
            <FaLayerGroup className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Batch History
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} batches</p>
          </div>
        </div>
        <input type="text" placeholder="Search Batch ID..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 transition w-full md:w-64"
        />
      </div>

      {/* MAIN TABLE */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[800px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Batch ID</th>
                <th>Pair</th>
                <th>Total Trades</th>
                <th>Amount</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td><span className="text-gray-500">{(page - 1) * limit + index + 1}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400 truncate max-w-[120px]">{item._id}</span>
                        <button onClick={() => copyText(item._id)}>
                          <FaCopy className="text-gray-500 hover:text-blue-400 transition cursor-pointer" />
                        </button>
                      </div>
                    </td>
                    <td className="font-mono font-medium text-white">{item.pair}</td>
                    <td className="text-gray-300">{item.totalTrades}</td>
                    <td className="font-semibold text-brand-gold">{Number(item.totalUsedUSDT).toFixed(4)}</td>
                    <td className="text-center">
                      <span className={`glass-badge ${item.status === "CLOSED" ? "glass-badge-danger" : item.openTrades > 0 ? "glass-badge-success" : "glass-badge-warning"}`}>
                        {item.status === "CLOSED" ? "Closed" : item.openTrades > 0 ? "Open" : "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-center items-center">
                        <button onClick={() => navigate(`/batchdetails/${item._id}`)}
                          className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-xs rounded-lg font-semibold transition">
                          View
                        </button>
                        {item.status === "CLOSED" || item.openTrades === 0 ? (
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-500 cursor-not-allowed">Closed</span>
                        ) : (
                          <button onClick={() => handleCloseBatch(item._id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded-lg font-semibold transition">
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))
              ) : loading || !showNoData ? (
                <tr><td colSpan="8" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
              ) : (
                <tr><td colSpan="8" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default AllBatches;