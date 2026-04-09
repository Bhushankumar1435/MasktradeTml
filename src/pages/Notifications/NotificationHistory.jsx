import React, { useEffect, useState } from "react";
import { getAllNotificationsApi, markNotificationReadApi, sendNotificationApi, broadcastNotificationApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const Notifications = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [showNoData, setShowNoData] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const totalPages = Math.ceil(total / limit);
    const [replyOpenId, setReplyOpenId] = useState(null);
    const [replyData, setReplyData] = useState({
        title: "",
        message: "",
    });

    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: "",
        message: "",
    });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setShowNoData(false);

            const res = await getAllNotificationsApi(page, limit);

            setData(res?.data?.data || []);
            setTotal(res?.data?.total || 0);

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (item) => {
        if (item.isRead) return;
        try {
            await markNotificationReadApi(item._id);
            setData(prev =>
                prev.map(n =>
                    n._id === item._id ? { ...n, isRead: true } : n
                )
            );
            toast.success("Marked as read ✅");
        } catch (err) {
            console.error(err);
            toast.error("Failed to mark as read ❌");
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };
   

    


    useEffect(() => {
        const delay = setTimeout(() => {
            fetchNotifications();
        }, 200);

        const timer = setTimeout(() => {
            setShowNoData(true);
        }, 1000);

        return () => {
            clearTimeout(delay);
            clearTimeout(timer);
        };
    }, [page]);

    // Pagination
    const handlePageChange = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

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

    return (
        <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
                    Notifications ({total})
                </h1>

                <div className="flex gap-4">
                <button
                    onClick={() => setBroadcastOpen(true)}
                    className="px-3 py-2 bg-green-600 rounded text-sm font-semibold hover:bg-green-700"
                >
                    Send To All
                </button>

                
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                    <table className="min-w-[900px] w-full text-sm border-collapse">

                        <thead className="bg-gradient-to-r from-[#d6a210]  whitespace-nowrap to-[#d3b769] text-white uppercase">
                            <tr>

                                {selectionMode && (
                                    <th className="px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                data.length > 0 &&
                                                data.every(item => selectedIds.includes(item._id))
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // select current page only
                                                    setSelectedIds(prev => [
                                                        ...new Set([...prev, ...data.map(d => d._id)])
                                                    ]);
                                                } else {
                                                    // unselect current page only
                                                    setSelectedIds(prev =>
                                                        prev.filter(id => !data.some(d => d._id === id))
                                                    );
                                                }
                                            }}
                                        />
                                    </th>
                                )}

                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">Message</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Notify</th>
                                <th className="px-3 py-2">Time</th>

                                {selectionMode && (
                                    <th className="px-3 py-2">Delete</th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        onClick={() => !selectionMode && handleMarkRead(item)}
                                        className={`text-center font-semibold transition-all  whitespace-nowrap
                                       ${!item.isRead
                                                ? "bg-[#1e293b] border-l-4 border-blue-500"
                                                : "hover:bg-[#1e293b]/60 text-gray-400"
                                            }`}
                                    >

                                       

                                        {/* INDEX */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        {/* USER */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.receiverId}
                                        </td>

                                        {/* TITLE */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.title}
                                        </td>

                                        {/* MESSAGE */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.message}
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.type}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-3 py-3 border border-gray-700 cursor-pointer">
                                            {item.isRead ? (
                                                <span className="px-2 py-1 text-xs bg-gray-600 rounded">Read</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-blue-600 rounded animate-pulse">New</span>
                                            )}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReplyOpenId(item._id);
                                                    setReplyData({
                                                        title: `Re: ${item.title}`,
                                                        message: "",
                                                    });
                                                }}
                                                className="px-2 py-1 text-xs bg-[#d6a210] rounded hover:bg-[#ad8619]"
                                            >
                                                Reply
                                            </button>
                                        </td>

                                        {/* TIME */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>

                                       

                                    </tr>
                                ))
                            ) : loading || !showNoData ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40">
                                    <Loader />
                                </div>
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-6 text-gray-500">
                                        No Notifications Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* LOADER */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 z-10">
                            <Loader />
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

                    <span className="text-gray-400">
                        Page {page} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">

                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                        >
                            ‹
                        </button>

                        {getPageNumbers().map((num, i) =>
                            num === "..." ? (
                                <span key={i}>...</span>
                            ) : (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(num)}
                                    className={page === num ? "text-[#d6a210]" : ""}
                                >
                                    {num}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
            {replyOpenId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                    <div className="bg-[#020817] w-[90%] md:w-[400px] p-4 rounded-lg border border-gray-700">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-[#d6a210] font-semibold">Reply</h2>

                            <button
                                onClick={() => setReplyOpenId(null)}
                                className="text-red-500 text-lg"
                            >
                                ❌
                            </button>
                        </div>

                        {/* TITLE */}
                        <input
                            type="text"
                            value={replyData.title}
                            onChange={(e) =>
                                setReplyData({ ...replyData, title: e.target.value })
                            }
                            className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] border border-gray-600 text-white"
                            placeholder="Title"
                        />

                        {/* MESSAGE */}
                        <textarea
                            value={replyData.message}
                            onChange={(e) =>
                                setReplyData({ ...replyData, message: e.target.value })
                            }
                            className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] border border-gray-600 text-white"
                            rows={4}
                            placeholder="Message"
                        />

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setReplyOpenId(null)}
                                className="px-3 py-1 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await sendNotificationApi({
                                            receiverId: replyOpenId,
                                            title: replyData.title,
                                            message: replyData.message,
                                        });

                                        toast.success("Reply sent ✅");
                                        setReplyOpenId(null);

                                    } catch (err) {
                                        toast.error("Failed to send ❌");
                                    }
                                }}
                                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {broadcastOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                    <div className="bg-[#020817] w-[90%] md:w-[400px] p-4 rounded-lg border border-gray-700">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-green-400 font-semibold">Send To All</h2>

                            <button
                                onClick={() => setBroadcastOpen(false)}
                                className="text-red-500 text-lg"
                            >
                                ❌
                            </button>
                        </div>

                        {/* TITLE */}
                        <input
                            type="text"
                            value={broadcastData.title}
                            onChange={(e) =>
                                setBroadcastData({ ...broadcastData, title: e.target.value })
                            }
                            className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] border border-gray-600 text-white"
                            placeholder="Title"
                        />

                        {/* MESSAGE */}
                        <textarea
                            value={broadcastData.message}
                            onChange={(e) =>
                                setBroadcastData({ ...broadcastData, message: e.target.value })
                            }
                            className="w-full mb-3 px-3 py-2 rounded bg-[#0f172a] border border-gray-600 text-white"
                            rows={4}
                            placeholder="Message"
                        />

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setBroadcastOpen(false)}
                                className="px-3 py-1 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await broadcastNotificationApi({
                                            title: broadcastData.title,
                                            message: broadcastData.message,
                                        });

                                        toast.success("Sent to all users ✅");
                                        setBroadcastOpen(false);

                                    } catch (err) {
                                        toast.error("Failed ❌");
                                    }
                                }}
                                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;