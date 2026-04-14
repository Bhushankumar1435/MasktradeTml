import React, { useEffect, useState } from "react";
import { getAllIncomeApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaChartLine } from "react-icons/fa";

const Income = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showNoData, setShowNoData] = useState(false);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getAllIncomeApi(page, limit, search);
      setData(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (error) { toast.error(error?.response?.data?.message || `Failed to fetch income`); } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchIncome(), 200);
    return () => clearTimeout(delay);
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

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

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 bg-brand-gold/10">
            <FaChartLine className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Income History
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} records</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by User ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-[250px] bg-white/5 border border-white/10 px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all text-white placeholder-gray-500"
        />
      </div>

      {/* Container */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[700px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>From</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td><span className="text-gray-500">{(page - 1) * limit + index + 1}</span></td>
                    <td className="font-medium text-white">{item.userId}</td>
                    <td>
                      <span className={`glass-badge ${item.amount > 0 ? "glass-badge-success" : "glass-badge-danger"}`}>
                        {item.amount}
                      </span>
                    </td>
                    <td className="text-gray-300">{item.type || "—"}</td>
                    <td className="text-gray-300">{item.fromUserId || "—"}</td>
                    <td className="max-w-[200px]">
                      <p className="truncate text-gray-400" title={item.description || "—"}>{item.description || "—"}</p>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="6" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default Income;