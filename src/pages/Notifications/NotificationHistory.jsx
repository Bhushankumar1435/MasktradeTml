import React, { useEffect, useState } from "react";
import { getAllNotificationsApi, markNotificationReadApi, sendNotificationApi, broadcastNotificationApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { FaBell, FaBroadcastTower } from "react-icons/fa";

const Notifications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showNoData, setShowNoData] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyData, setReplyData] = useState({ title: "", message: "" });
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: "", message: "" });
  const totalPages = Math.ceil(total / limit);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getAllNotificationsApi(page, limit);
      setData(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to fetch notifications`); } finally {
      setLoading(false);
      setTimeout(() => setShowNoData(true), 300);
    }
  };

  const handleMarkRead = async (item) => {
    if (item.isRead) return;
    try {
      await markNotificationReadApi(item._id);
      setData(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
      toast.success("Marked as read");
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to mark as read`); }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchNotifications(), 200);
    return () => clearTimeout(delay);
  }, [page]);

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
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaBell className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm mt-1">Total: {total} records</p>
          </div>
        </div>
        <button onClick={() => setBroadcastOpen(true)}
          className="whitespace-nowrap shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <FaBroadcastTower /> Send To All
        </button>
      </div>

      {/* TABLE */}
      <div className="glass-table-container flex flex-col z-10">
        <div className="w-full overflow-x-auto relative">
          <table className="min-w-[800px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th className="text-center">Status</th>
                <th className="text-center">Reply</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id}
                    onClick={() => handleMarkRead(item)}
                    className={`cursor-pointer ${!item.isRead ? "border-l-2 border-blue-500" : "opacity-70"}`}>
                    <td><span className="text-gray-500">{(page - 1) * limit + index + 1}</span></td>
                    <td className="text-white font-medium">{item.receiverId}</td>
                    <td className="font-medium text-gray-200">{item.title}</td>
                    <td className="max-w-[200px]">
                      <p className="truncate text-gray-400" title={item.message}>{item.message}</p>
                    </td>
                    <td className="text-gray-400">{item.type}</td>
                    <td className="text-center">
                      {item.isRead ? (
                        <span className="glass-badge bg-gray-500/10 text-gray-400 border-gray-500/20">Read</span>
                      ) : (
                        <span className="glass-badge bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse">New</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button onClick={(e) => { e.stopPropagation(); setReplyOpenId(item._id); setReplyData({ title: `Re: ${item.title}`, message: "" }); }}
                        className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-xs rounded-lg font-semibold transition">
                        Reply
                      </button>
                    </td>
                    <td className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td>
                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr><td colSpan="8" className="text-center py-12"><span className="opacity-0">Loading...</span></td></tr>
                ) : (
                  <tr><td colSpan="8" className="text-center py-12 text-gray-500 font-medium">No Notifications Found</td></tr>
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

      {/* REPLY MODAL */}
      {replyOpenId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-brand-gold font-semibold text-lg">Reply Notification</h3>
              <button onClick={() => setReplyOpenId(null)} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>
            <input value={replyData.title} onChange={(e) => setReplyData({ ...replyData, title: e.target.value })}
              className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
              placeholder="Title" />
            <textarea value={replyData.message} onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 resize-none"
              rows={4} placeholder="Message" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setReplyOpenId(null)}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition">Cancel</button>
              <button onClick={async () => {
                try {
                  await sendNotificationApi({ receiverId: replyOpenId, title: replyData.title, message: replyData.message });
                  toast.success("Reply sent!");
                  setReplyOpenId(null);
                } catch (err) { toast.error(err?.response?.data?.message || `Failed to send`); }
              }}
                className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold rounded-xl text-sm font-semibold transition">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BROADCAST MODAL */}
      {broadcastOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-emerald-400 font-semibold text-lg flex items-center gap-2"><FaBroadcastTower /> Broadcast to All</h3>
              <button onClick={() => setBroadcastOpen(false)} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>
            <input value={broadcastData.title} onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
              className="w-full mb-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              placeholder="Title" />
            <textarea value={broadcastData.message} onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
              rows={4} placeholder="Message for all users..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => setBroadcastOpen(false)}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition">Cancel</button>
              <button onClick={async () => {
                try {
                  await broadcastNotificationApi({ title: broadcastData.title, message: broadcastData.message });
                  toast.success("Sent to all users!");
                  setBroadcastOpen(false);
                } catch (err) { toast.error(err?.response?.data?.message || `Failed`); }
              }}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition">
                Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;