import React, { useEffect, useState } from "react";
import { getMyProfitHistoryApi } from "../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/ui/Loader";
import { FaChartPie } from "react-icons/fa";

const PAGE_SIZE = 10;

const PnlHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchData = async () => {
    setLoading(true);
    setShowNoData(false);
    try {
      const res = await getMyProfitHistoryApi(page, PAGE_SIZE, search, type);
      if (res?.data?.success) {
        setData(Array.isArray(res.data.data) ? res.data.data : []);
        setTotal(res.data.total || 0);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (err) { toast.error(err?.response?.data?.message || `Server error`); }
    finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchData(), 200);
    return () => clearTimeout(delay);
  }, [page, search, type]);

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

  const typeFilters = [
    { label: "All", value: "", cls: "bg-white/5 border border-white/10 hover:bg-white/10 text-white" },
    { label: "Profit", value: "PROFIT", cls: "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20" },
    { label: "Loss", value: "LOSS", cls: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20" },
  ];

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <ToastContainer />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 bg-brand-gold/10">
            <FaChartPie className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Profit & Loss
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} records</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Search User ID..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 transition"
          />
          {typeFilters.map((f) => (
            <button key={f.value} onClick={() => { setType(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${f.cls} ${type === f.value ? "ring-1 ring-white/20" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[900px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Pair</th>
                <th className="text-center">Type</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
                <th className="text-center">PnL</th>
                <th>Fee</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, i) => (
                  <tr key={i}>
                    <td><span className="text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</span></td>
                    <td className="font-medium text-white">{item.userId}</td>
                    <td className="font-mono text-gray-300">{item.pair}</td>
                    <td className="text-center">
                      <span className={`glass-badge ${item.type === "PROFIT" ? "glass-badge-success" : "glass-badge-danger"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="text-gray-300">{item.side}</td>
                    <td className="text-gray-300">{item.qty}</td>
                    <td className="text-gray-300">{item.price}</td>
                    <td className={`text-center font-bold ${item.isProfit ? "text-green-400" : "text-red-400"}`}>
                      {item.pnl.toFixed(2)}
                    </td>
                    <td className="text-gray-400">{item.commission}</td>
                    <td className="text-gray-500 text-xs">{`${item.date} ${item.time}`}</td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="10" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="10" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default PnlHistory;