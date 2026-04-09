import React, { useEffect, useState } from "react";
import { getAllBatchesApi, closeTradeByBatchApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllBatches = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [showNoData, setShowNoData] = useState(false);
    const navigate = useNavigate();

    const totalPages = Math.ceil(total / limit);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setShowNoData(false);

            // API call
            const res = await getAllBatchesApi(page, limit, search);

            setData(res?.data?.data || []);
            setTotal(res?.data?.pagination?.total || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch batches");
        } finally {
            setLoading(false);
        }
    };

    

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchBatches();
        }, 200);

        const timer = setTimeout(() => {
            setShowNoData(true);
        }, 1000);

        return () => {
            clearTimeout(delay);
            clearTimeout(timer);
        };
    }, [page, search]);

    const handleCloseBatch = async (batchId) => {
        try {
            const confirm = window.confirm("Close all trades for this batch?");
            if (!confirm) return;

            const res = await closeTradeByBatchApi(batchId);

            if (res?.data?.success) {
                toast.success(res.data.message || "Batch Closed ✅");
                fetchBatches(); // refresh list
            } else {
                toast.error("Something went wrong ❌");
            }

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Close Failed ❌");
        }
    };

    const copyText = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    // Pagination helpers
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
            <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
                        All Batches ({total})
                    </h1>
                </div>

                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="Search Batch ID..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded bg-[#1e293b] border border-gray-600 text-sm w-full md:w-64"
                />
            </div>

            {/* MAIN TABLE */}
            <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                    <table className="min-w-[800px] w-full text-sm border-collapse">
                        <thead className="bg-gradient-to-r from-[#d6a210] to-[#d3b769] text-white uppercase  whitespace-nowrap  border-[#d6a210]">
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Batch ID</th>
                                <th className="px-3 py-2">Pair</th>
                                <th className="px-3 py-2">Total Trades</th>
                                {/* <th className="px-3 py-2">Total PnL</th> */}
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Action</th>
                                <th className="px-3 py-2">Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr
                                        key={item._id}

                                        className="text-center font-semibold hover:bg-[#1e293b]  whitespace-nowrap cursor-pointer transition"
                                    >
                                        {/* INDEX */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        {/* BATCH ID */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <div
                                                className="flex items-center justify-center gap-2"
                                                onClick={(e) => e.stopPropagation()} // stop row click
                                            >
                                                {item._id}
                                                <FaCopy
                                                    onClick={() => copyText(item._id)}
                                                    className="cursor-pointer text-gray-400 hover:text-blue-400"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.pair}
                                        </td>

                                        {/* TOTAL TRADES */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.totalTrades}
                                        </td>

                                        {/* PNL */}
                                        {/* <td
                                            className={`px-3 py-3 border border-gray-700 ${item.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {item.totalPnl.toFixed(2)}
                                        </td> */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {Number(item.totalUsedUSDT).toFixed(4)}
                                        </td>

                                        {/* STATUS BADGE */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <span
                                                className={`px-2 py-1 text-xs rounded text-white ${item.status === "CLOSED"
                                                    ? "bg-red-500"
                                                    : item.openTrades > 0
                                                        ? "bg-green-500"
                                                        : "bg-yellow-500"
                                                    }`}
                                            >
                                                {item.status === "CLOSED"
                                                    ? "Closed"
                                                    : item.openTrades > 0
                                                        ? "Open"
                                                        : "Unknown"}
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <div className="flex gap-2 justify-center">

                                                {/* VIEW BUTTON */}
                                                <button
                                                    onClick={() => navigate(`/batchdetails/${item._id}`)}
                                                    className="px-3 py-1 bg-[#d6a210] rounded text-sm hover:bg-[#ad8619]"
                                                >
                                                    View
                                                </button>

                                                {/* CLOSE / CLOSED */}
                                                {item.status === "CLOSED" || item.openTrades === 0 ? (
                                                    <span className="px-3 py-1 bg-gray-600 rounded text-xs cursor-not-allowed">
                                                        Closed
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCloseBatch(item._id)}
                                                        className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
                                                    >
                                                        Close
                                                    </button>
                                                )}

                                            </div>
                                        </td>

                                        {/* CREATED */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : loading || !showNoData ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">
                                    <Loader />
                                </div>
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* LOADING */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
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
                        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
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

                        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllBatches;