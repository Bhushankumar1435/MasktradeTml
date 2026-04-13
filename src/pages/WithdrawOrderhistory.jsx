import React, { useEffect, useState } from "react";
import { getWithdrawOrdersApi, manageWithdrawApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import { FaCopy, FaArrowUp } from "react-icons/fa";
import Loader from "../components/ui/Loader";

const WithdrawOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [remark, setRemark] = useState("");
  const [showNoData, setShowNoData] = useState(false);

  const fetchWithdraws = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getWithdrawOrdersApi(page, limit, status, search);
      setData(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.count || 0);
    } catch {
      toast.error("Failed to fetch withdraw orders");
    } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchWithdraws(), 200);
    return () => clearTimeout(delay);
  }, [page, status, search]);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;
    try {
      await manageWithdrawApi({ id, status: "APPROVED", remarks: "Approved" });
      toast.success("Approved");
      fetchWithdraws();
    } catch { toast.error("Error"); }
  };

  const openRejectModal = (id) => { setSelectedId(id); setRemark(""); setShowModal(true); };

  const submitReject = async () => {
    if (!remark.trim()) return toast.error("Enter remark");
    try {
      await manageWithdrawApi({ id: selectedId, status: "REJECTED", remarks: remark });
      toast.success("Rejected");
      setShowModal(false);
      fetchWithdraws();
    } catch { toast.error("Error"); }
  };

  const totalPages = Math.ceil(total / limit);
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

  const copyText = async (text) => {
    if (!text) return toast.error("Nothing to copy");
    try { await navigator.clipboard.writeText(text); toast.success("Copied!"); }
    catch { toast.error("Failed to copy"); }
  };

  const truncateAddress = (address) => {
    if (!address) return "—";
    if (address.length <= 15) return address;
    return `${address.slice(0, 7)}.....${address.slice(-7)}`;
  };

  const statusFilter = [
    { label: "All", value: "", cls: "bg-white/5 border border-white/10 hover:bg-white/10" },
    { label: "Pending", value: "PENDING", cls: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20" },
    { label: "Approved", value: "APPROVED", cls: "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20" },
    { label: "Rejected", value: "REJECTED", cls: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20" },
  ];

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-outfit relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 bg-brand-gold/10">
            <FaArrowUp className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Withdraw Orders
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} records</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search by User ID / Address"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full md:w-[220px] px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 transition"
          />
          {statusFilter.map((f) => (
            <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${f.cls} ${status === f.value ? "ring-1 ring-white/20" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[1000px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payable</th>
                <th>Address</th>
                <th>Remark</th>
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
                    <td className="font-medium text-white">{item.userId}</td>
                    <td className="font-semibold text-brand-gold">{item.amount}</td>
                    <td className="font-semibold text-emerald-400">{item.payableAmount}</td>
                    <td className="max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-gray-400 max-w-[140px]" title={item.address || "—"}>{truncateAddress(item.address)}</p>
                        {item.address && (
                          <button onClick={() => copyText(item.address)}>
                            <FaCopy className="text-gray-400 hover:text-blue-400 transition cursor-pointer" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[200px]">
                      <p className="truncate text-gray-400" title={item.remarks || "—"}>{item.remarks || "—"}</p>
                    </td>
                    <td className="text-center">
                      <span className={`glass-badge ${item.status === "APPROVED" ? "glass-badge-success" : item.status === "REJECTED" ? "glass-badge-danger" : "glass-badge-warning"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleApprove(item._id)} disabled={item.status !== "PENDING"}
                          className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs rounded-lg font-semibold transition disabled:opacity-30">
                          Approve
                        </button>
                        <button onClick={() => openRejectModal(item._id)} disabled={item.status !== "PENDING"}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded-lg font-semibold transition disabled:opacity-30">
                          Reject
                        </button>
                      </div>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
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

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Enter Reject Remark</h3>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl mb-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 resize-none"
              rows={4} placeholder="Reason for rejection..." />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition">Cancel</button>
              <button onClick={submitReject}
                className="bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawOrders;