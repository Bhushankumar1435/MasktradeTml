import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPaidUsersApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import { FaCrown } from "react-icons/fa";

const PaidUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showNoData, setShowNoData] = useState(false);

  const fetchPaidUsers = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getPaidUsersApi(page, limit);
      setData(res?.data?.data?.users || []);
      setTotal(res?.data?.data?.count || 0);
      setTotalPages(res?.data?.data?.totalPages || 1);
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to fetch paid users`); }
    finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchPaidUsers(), 200);
    return () => clearTimeout(delay);
  }, [page]);

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
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
          <FaCrown className="text-brand-gold text-xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            Paid Users
          </h1>
          <p className="text-gray-400 text-sm mt-1">Total: {total} users</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[900px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>User ID</th>
                <th>Sponsor</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Packages</th>
                <th>Activation</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id}>
                    <td><span className="text-gray-500">{(page - 1) * limit + index + 1}</span></td>
                    <td className="font-medium text-white">{item.name || "—"}</td>
                    <td><span className="bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-xs">{item.userId || "—"}</span></td>
                    <td className="text-gray-400">{item.sponsorId || "—"}</td>
                    <td className="text-gray-400 max-w-[180px] truncate">{item.email || "—"}</td>
                    <td className="font-semibold text-brand-gold">{item?.package?.totalPackageAmount || "—"}</td>
                    <td className="text-gray-300">{item?.package?.totalPackageCount || "—"}</td>
                    <td className="text-gray-500 text-xs">
                      {item?.package?.activationDate ? new Date(item.package.activationDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="text-gray-500 text-xs">
                      {item?.package?.expiryDate ? new Date(item.package.expiryDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="9" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="9" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default PaidUsers;