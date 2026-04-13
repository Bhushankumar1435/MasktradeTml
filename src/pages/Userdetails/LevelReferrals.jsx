import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReferralByLevelApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import { FaArrowLeft, FaUsers } from "react-icons/fa";

const PAGE_SIZE = 10;

const LevelReferrals = () => {
  const { userId, level } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNoData, setShowNoData] = useState(false);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getReferralByLevelApi(userId, level, page, PAGE_SIZE);
      if (res.data?.success) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) { console.log(err); }
    finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchReferrals(), 200);
    return () => clearTimeout(delay);
  }, [userId, level, page]);

  useEffect(() => { setPage(1); }, [level]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

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
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-blue-500/30 rounded-xl bg-blue-500/10">
            <FaUsers className="text-blue-400 text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Level {level} Referrals
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} users</p>
          </div>
        </div>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all self-start md:self-auto">
          <FaArrowLeft className="text-xs" /> Back
        </button>
      </div>

      {/* TABLE */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[800px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Sponsor</th>
                <th>Package</th>
                <th className="text-center">Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id || index}>
                    <td><span className="text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</span></td>
                    <td><span className="bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-xs">{item.userId}</span></td>
                    <td className="font-medium text-white">{item.name}</td>
                    <td className="text-gray-400">{item.sponsorId}</td>
                    <td className="text-gray-300">{item.package}</td>
                    <td className="text-center">
                      <span className={`glass-badge ${item.status === "ACTIVE" ? "glass-badge-success" : "glass-badge-danger"}`}>
                        {item.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {item.activationDate && item.activationDate !== "0000-00-00"
                        ? new Date(item.activationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="7" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-500 font-medium">No Data Found</td></tr>
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

export default LevelReferrals;