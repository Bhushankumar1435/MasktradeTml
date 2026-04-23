import React, { useEffect, useState } from "react";
import { getBindUsersApi, getUserBalanceApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import { FaSyncAlt, FaLink } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

import PaginationLimit from "../components/ui/PaginationLimit";

const BindUsers = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showNoData, setShowNoData] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getBindUsersApi(page, limit, "bind");
      if (res.data?.success) {
        const apiData = res.data.data;
        setData(apiData?.users || []);
        setTotal(apiData?.count || 0);
        setTotalPages(apiData?.totalPages || 1);
      }
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to fetch users`); } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  const fetchBalance = async (userId) => {
    try {
      setBalanceLoading(true);
      const res = await getUserBalanceApi(userId);
      if (res.data?.success) {
        setBalanceData(res?.data?.data?.[0]?.availableBalance);
      }
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to fetch balance`); }
    finally { setBalanceLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 200);
    return () => clearTimeout(delay);
  }, [page, limit]);

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
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
          <FaLink className="text-brand-gold text-xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            API Bound Users
          </h1>
          <p className="text-gray-400 text-sm mt-1">Total: {total} users</p>
        </div>
      </div>

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
          <table className="min-w-[800px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>User ID</th>
                <th>Email</th>
                <th className="text-center">Balance</th>
                <th className="text-center">Status</th>
                <th className="text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td><span className="text-gray-500">{(page - 1) * limit + index + 1}</span></td>
                    <td className="font-medium text-white">{item.name || "N/A"}</td>
                    <td><span className="bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-xs">{item.userId || "N/A"}</span></td>
                    <td className="text-gray-400 max-w-[200px] truncate">{item.email || "N/A"}</td>
                    <td className="text-center">
                      {selectedUserId === item.userId ? (
                        balanceLoading ? (
                          <FaSyncAlt className="animate-spin text-brand-gold text-lg mx-auto" />
                        ) : (
                          <span className="text-emerald-400 font-semibold">{balanceData ?? 0}</span>
                        )
                      ) : (
                        <button
                          onClick={() => { setSelectedUserId(item.userId); fetchBalance(item.userId); }}
                          className="text-brand-gold hover:text-yellow-300 transition" title="Fetch Balance">
                          <FaSyncAlt className="text-lg mx-auto" />
                        </button>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`glass-badge ${item.paidStatus ? "glass-badge-success" : "glass-badge-danger"}`}>
                        {item.paidStatus ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button onClick={() => navigate(`/binance-orders/${item.userId}`)}
                        className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold hover:text-yellow-300 text-xs rounded-lg font-semibold transition-all hover:shadow-glow-gold">
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="7" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-500 font-medium">No API Users Found</td></tr>
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

export default BindUsers;