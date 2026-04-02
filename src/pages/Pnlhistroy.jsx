import React, { useEffect, useState } from "react";
import { getMyProfitHistoryApi } from "../ApiService/Adminapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const PnlHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getMyProfitHistoryApi(
                page,
                PAGE_SIZE,
                search,
                type
            );

            if (res?.data?.success) {
                setData(Array.isArray(res.data.data) ? res.data.data : []);
                setTotal(res.data.total || 0);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search, type]);

    // ✅ SAME PAGINATION LOGIC
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
        <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

            <ToastContainer />

            {/* HEADER */}
            <div className="mb-4 flex flex-col md:flex-row justify-between gap-3">
                <div className="flex items-center gap-4 ">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-white">
                        Profit & Loss ({total})
                    </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Search User ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="bg-[#1e293b] px-3 py-2 rounded text-sm border border-gray-700"
                    />

                    <div className="flex flex-wrap gap-2">

                        {/* ALL */}
                        <button
                            onClick={() => {
                                setType("");
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded text-sm font-semibold transition 
                              ${type === ""
                                    ? "bg-blue-700 text-white"
                                    : "bg-gray-500 text-gray-300 hover:bg-blue-600 hover:text-white"
                                }`}
                        >
                            All
                        </button>

                        {/* PROFIT */}
                        <button
                            onClick={() => {
                                setType("PROFIT");
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded text-sm font-semibold transition 
                            ${type === "PROFIT"
                                    ? "bg-green-700 text-white"
                                    : "bg-gray-500 text-gray-300 hover:bg-green-600 hover:text-white"
                                }`}
                        >
                            Profit
                        </button>

                        {/* LOSS */}
                        <button
                            onClick={() => {
                                setType("LOSS");
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded text-sm font-semibold transition 
                                 ${type === "LOSS"
                                    ? "bg-red-700 text-white"
                                    : "bg-gray-500 text-gray-300 hover:bg-red-600 hover:text-white"
                                }`}
                        >
                            Loss
                        </button>

                    </div>
                </div>
            </div>

            {/* MAIN CONTAINER */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* TABLE */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                    <table className="min-w-[900px] w-full text-sm border-collapse">

                        <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-700">#</th>
                                <th className="px-3 py-2 border-r border-gray-700">User</th>
                                <th className="px-3 py-2 border-r border-gray-700">Pair</th>
                                <th className="px-3 py-2 border-r border-gray-700">Type</th>
                                <th className="px-3 py-2 border-r border-gray-700">Side</th>
                                <th className="px-3 py-2 border-r border-gray-700">Qty</th>
                                <th className="px-3 py-2 border-r border-gray-700">Price</th>
                                <th className="px-3 py-2 border-r border-gray-700">PnL</th>
                                <th className="px-3 py-2 border-r border-gray-700">Fee</th>
                                <th className="px-3 py-2 border-r border-gray-700">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, i) => (
                                    <tr key={i} className="hover:bg-[#1e293b] font-semibold transition text-center">

                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * PAGE_SIZE + i + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">{item.userId}</td>
                                        <td className="px-3 py-3 border border-gray-700">{item.pair}</td>

                                        <td className={`px-3 py-3 border border-gray-700 ${item.type === "PROFIT"
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}>
                                            {item.type}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">{item.side}</td>
                                        <td className="px-3 py-3 border border-gray-700">{item.qty}</td>
                                        <td className="px-3 py-3 border border-gray-700">{item.price}</td>

                                        <td className={`px-3 py-3 border border-gray-700 ${item.isProfit
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}>
                                            {item.pnl}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">{item.commission}</td>
                                        <td className="px-3 py-3 border border-gray-700">{`${item.date} ${item.time}`}</td>

                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="11" className="text-center py-6 text-gray-500">
                                            No Data Found
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

                    <span className="text-gray-400">
                        Page {page} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">

                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
                        >
                            ‹
                        </button>

                        {getPageNumbers().map((num, index) =>
                            num === "..." ? (
                                <span key={index} className="text-gray-400 text-sm">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(num)}
                                    className={`flex items-center justify-center rounded-md text-sm font-semibold transition ${page === num
                                        ? "text-[#d6a210]"
                                        : "text-gray-300 hover:text-[#d3b769]"
                                        }`}
                                >
                                    {num}
                                </button>
                            )
                        )}

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
        </div>
    );
};

export default PnlHistory;