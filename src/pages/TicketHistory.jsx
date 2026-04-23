import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { GetAdminTicketHistoryApi, ManageAdminTicketApi } from "../ApiService/Adminapi";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/ui/Loader";
import { FaTicketAlt } from "react-icons/fa";

import PaginationLimit from "../components/ui/PaginationLimit";

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const totalPages = Math.ceil(total / limit);

  const fetchTickets = async () => {
    setLoading(true);
    setShowNoData(false);
    try {
      const res = await GetAdminTicketHistoryApi(page, limit);
      if (res?.data?.success) {
        const ticketsData = res?.data?.data?.tickets || [];
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setTotal(res?.data?.data?.pagination?.totalTickets || 0);
      } else {
        toast.error(res?.data?.message || "Failed to fetch tickets");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchTickets(), 200);
    return () => clearTimeout(delay);
  }, [page, limit]);

  const openPopup = (index) => { setSelectedIndex(index); setMessage(""); setShowPopup(true); };

  const submitMessage = async () => {
    if (!message.trim()) return toast.error("Message required");
    try {
      const ticketId = tickets[selectedIndex]?._id;
      const res = await ManageAdminTicketApi({ ticketId, message });
      if (res?.data?.success) {
        toast.success("Message sent!");
        setShowPopup(false);
        fetchTickets();
      } else {
        toast.error(res?.data?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    }
  };

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
      <ToastContainer />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="p-2 border border-brand-gold/30 rounded-xl shadow-glow-gold/20 bg-brand-gold/10">
          <FaTicketAlt className="text-brand-gold text-xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            Support Tickets
          </h1>
          <p className="text-gray-400 text-sm mt-1">{tickets.length} tickets loaded</p>
        </div>
      </div>

      {/* Main Container */}
      {/* Top Controls: Rows per page */}
      <div className="flex justify-end mb-4 relative z-10 px-2">
          <PaginationLimit 
              value={limit} 
              onChange={(val) => { setLimit(val); setPage(1); }} 
          />
      </div>
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[700px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th className="text-center">Attachment</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((t, i) => (
                  <tr key={t._id}>
                    <td><span className="text-gray-500">{(page - 1) * limit + i + 1}</span></td>
                    <td><span className="bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-xs">{t.userId}</span></td>
                    <td className="font-medium text-white">{t.user?.name}</td>
                    <td className="max-w-[200px]">
                      <p className="truncate text-gray-400" title={t.subject || "—"}>{t.subject || "—"}</p>
                    </td>
                    <td className="text-center">
                      {t.doc ? (
                        <a href={`https://api.robofict.mail-go.site/uploads/${t.doc}`} target="_blank" rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium underline transition">View File</a>
                      ) : <span className="text-gray-600">N/A</span>}
                    </td>
                    <td className="text-center">
                      <span className={`glass-badge ${t.status === "OPEN" ? "glass-badge-warning" : t.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "glass-badge-success"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button onClick={() => openPopup(i)}
                        className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold hover:text-yellow-300 text-xs rounded-lg font-semibold transition-all hover:shadow-glow-gold">
                        Reply
                      </button>
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

      {/* Ticket Chat Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl flex flex-col h-[500px] border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">Ticket Chat</p>
                <p className="text-gray-400 text-xs">{tickets[selectedIndex]?.user?.name}</p>
              </div>
              <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-white transition text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 text-sm">
              {tickets[selectedIndex]?.message && (
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-gray-300">
                  {tickets[selectedIndex]?.message}
                </div>
              )}
              {tickets[selectedIndex]?.replies?.map((r, idx) => (
                <div key={idx} className={r.sender === "ADMIN" ? "text-right" : ""}>
                  <div className="inline-block bg-blue-600/20 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-300">
                    {r.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3">
              <input value={message} onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
                placeholder="Type a reply..." />
              <button onClick={submitMessage}
                className="bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketHistory;