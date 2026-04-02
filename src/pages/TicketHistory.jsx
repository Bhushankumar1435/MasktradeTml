import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  GetAdminTicketHistoryApi,
  ManageAdminTicketApi,
} from "../ApiService/Adminapi";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState("");
  const totalPages = Math.ceil(total / PAGE_SIZE);

 const fetchTickets = async () => {
  setLoading(true);
  try {
    const res = await GetAdminTicketHistoryApi(page, PAGE_SIZE); // ✅ FIX

    if (res?.data?.success) {
      const ticketsData = res?.data?.data?.tickets || [];

      setTickets(Array.isArray(ticketsData) ? ticketsData : []);

      setTotal(res?.data?.data?.pagination?.totalTickets || 0);

    } else {
      toast.error(res?.data?.message || "Failed to fetch tickets");
    }
  } catch (err) {
    console.log(err); // 👈 DEBUG
    toast.error(err?.response?.data?.message || "Server error");
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  fetchTickets();
}, [page]); 

  const openPopup = (index) => {
    setSelectedIndex(index);
    setMessage("");
    setShowPopup(true);
  };

  const submitMessage = async () => {
    if (!message.trim()) return toast.error("Message required");

    try {
      const ticketId = tickets[selectedIndex]?._id;

      const res = await ManageAdminTicketApi({
        ticketId,
        message,
      });

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

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (page > 4) {
        pages.push("...");
      }
      if (page > 3 && page < totalPages - 2) {
        pages.push(page);
      }
      if (page < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      <ToastContainer />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
       <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
        <h1 className="text-lg md:text-xl font-semibold text-white">
          Ticket List ({tickets.length})
        </h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* ✅ TABLE FOR ALL SCREENS */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">

          <table className="min-w-[700px] md:min-w-[900px] w-full text-sm border-collapse">

            <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 border-r border-gray-700">#</th>
                <th className="px-3 py-2 border-r border-gray-700">User ID</th>
                <th className="px-3 py-2 border-r border-gray-700">Name</th>
                <th className="px-3 py-2 border-r border-gray-700">Subject</th>
                <th className="px-3 py-2 border-r border-gray-700">View</th>
                <th className="px-3 py-2 border-r border-gray-700">Status</th>
                <th className="px-3 py-2 border-r border-gray-700">Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length > 0 ? (
                tickets.map((t, i) => (
                  <tr key={t._id} className="hover:bg-[#1e293b] font-semibold transition text-center">

                    <td className="px-3 py-3 border border-gray-700">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-3 py-3 border border-gray-700">{t.userId}</td>
                    <td className="px-3 py-3 border border-gray-700">{t.user?.name}</td>

                    <td className="px-3 py-3 border border-gray-700 max-w-[200px]">
                      <p className="truncate" title={t.subject || "-"}>
                        {t.subject || "-"}
                      </p>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {t.doc ? (
                        <a href={t.doc} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                          View File
                        </a>
                      ) : "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <span className={`px-2 py-1 text-xs rounded ${t.status === "OPEN"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : t.status === "IN_PROGRESS"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <button
                        onClick={() => openPopup(i)}
                        className="px-3 py-1 bg-[#d6a210] hover:bg-[#c49619] rounded text-white"
                      >
                        Reply
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

          {/* LEFT */}
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>

          {/* RIGHT (GROUP ALL BUTTONS) */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Previous */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ‹
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className=" text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={` flex items-center justify-center rounded-md text-sm font-semibold transition ${page === num
                    ? " text-[#d6a210]"
                    : "text-gray-300 hover:text-[#d3b769]"
                    }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ›
            </button>

          </div>
        </div>
      </div>

      {/* POPUP (UNCHANGED) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-2">
          <div className="bg-[#0f172a] w-full max-w-md rounded-xl flex flex-col h-[500px] border border-gray-700">

            <div className="p-3 border-b border-gray-700 flex justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Ticket Chat</p>
                <p className="text-gray-400 text-xs">
                  {tickets[selectedIndex]?.user?.name}
                </p>
              </div>
              <button onClick={() => setShowPopup(false)}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#020817] text-sm">
              {tickets[selectedIndex]?.message && (
                <div className="bg-gray-700 px-3 py-2 rounded">
                  {tickets[selectedIndex]?.message}
                </div>
              )}

              {tickets[selectedIndex]?.replies?.map((r, idx) => (
                <div key={idx} className={r.sender === "ADMIN" ? "text-right" : ""}>
                  <div className="inline-block bg-blue-600 px-3 py-2 rounded text-white">
                    {r.message}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-[#1e293b] px-3 py-2 rounded"
              />
              <button onClick={submitMessage} className="bg-blue-600 px-4 rounded">
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