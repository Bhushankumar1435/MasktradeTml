import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllBinanceOrdersapi, getUserDashboardApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../components/ui/Loader";

const PAGE_SIZE = 10;

const BinanceOrders = () => {
    const { userId } = useParams();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [userName, setUserName] = useState("");
    const [checkingUser, setCheckingUser] = useState(false);
    const [showNoData, setShowNoData] = useState(false);

    const navigate = useNavigate();


    const fetchOrders = async () => {
        try {
            setLoading(true);
            setShowNoData(false);

            const res = await getAllBinanceOrdersapi(
                page,
                PAGE_SIZE,
                userId
            );

            if (res?.data?.success) {

                setOrders(res?.data?.data || []);
                setTotal(res?.data?.total || 0);

                setTotalPages(res?.data?.pagination?.totalPages || 1);

            } else {
                toast.error("Failed to fetch orders");
            }

        } catch {
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchOrders();
        }, 200);
        const timer = setTimeout(() => {
            setShowNoData(true);
        }, 1000);
        return () => {
            clearTimeout(delay);
            clearTimeout(timer);
        };
    }, [page, userId]);


    // 🔥 Fetch user
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setUserName("");
                return;
            }

            setCheckingUser(true);

            try {
                const res = await getUserDashboardApi(userId);

                const user = res?.data?.data?.user;

                setUserName(user?.name || "User Found");

            } catch (err) {
                setUserName("User not found ❌");
            } finally {
                setCheckingUser(false);
            }
        };

        fetchUser();
    }, [userId]);

    // ✅ PAGINATION NUMBERS (same logic)
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
        <div className="w-full flex flex-col bg-[#0f172a] p-4 md:p-6 text-gray-200 rounded-md">

            {/* HEADER */}
            <div className="mb-4 flex flex-col gap-2">

                {/* 🔹 TOP ROW (Mobile: space-between, Desktop: normal) */}
                <div className="flex justify-between items-center">

                    <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#d6a210]">
                        Binance Orders ({total})
                    </h1>

                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                    >
                        ← Back
                    </button>

                </div>

                {/* 🔹 USER INFO */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">

                    <span className="text-xs sm:text-sm text-gray-400">
                        User ID:{" "}
                        <span className="text-[#d6a210] font-semibold break-all">
                            {userId}
                        </span>
                    </span>

                    <span className="text-xs sm:text-sm text-gray-300">
                        User:{" "}
                        <span className="text-[#d6a210] font-semibold">
                            {checkingUser ? "Loading..." : userName}
                        </span>
                    </span>

                </div>

            </div>

            {/* TABLE */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 relative">

                    <table className="min-w-[900px] w-full text-sm border-collapse">

                        <thead className="bg-gradient-to-r from-[#d6a210] to-[#d4b55e] text-white uppercase whitespace-nowrap border-b  border-[#d6a210]">
                            <tr>
                                <th className="px-3 py-2 ">#</th>
                                <th className="px-3 py-2 ">Order Id</th>
                                <th className="px-3 py-2 ">Pair</th>
                                <th className="px-3 py-2 ">Entry</th>
                                <th className="px-3 py-2 ">Current</th>
                                <th className="px-3 py-2 ">PNL</th>
                                <th className="px-3 py-2 ">PNL %</th>
                                <th className="px-3 py-2 ">QTY</th>
                                <th className="px-3 py-2 ">USED USDT</th>
                                <th className="px-3 py-2 ">Type</th>
                                <th className="px-3 py-2 ">TRADE ACTION</th>
                                <th className="px-3 py-2 ">Status</th>
                                <th className="px-3 py-2 ">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((o, i) => (
                                    <tr key={i} className="text-center font-semibold whitespace-nowrap hover:bg-[#1e293b]">

                                        <td className="px-3 py-3 border border-gray-700">
                                            {i + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.orderId}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.pair}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            <span className={o.side === "BUY" ? "text-green-400" : "text-red-400"}>
                                                {o.entryPrice}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.currentPrice}
                                        </td>

                                        <td className={`px-3 py-3 border border-gray-700 ${o.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {o.pnl.toFixed(2)}
                                        </td>

                                        <td
                                            className={`px-3 py-3 border border-gray-700 ${o.pnlPercent < 0 ? "text-red-400" : "text-green-400"
                                                }`}
                                        >
                                            {o.pnlPercent}%
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.quantity}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.usedUSDT}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.orderType}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {o.tradeAction}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                                                {o.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {new Date(o.time).toLocaleString()}
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                loading || !showNoData ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">
                                        {/* <div className="w-8 h-8 border-4 border-[#d6a210] border-t-transparent rounded-full animate-spin"></div> */}
                                        <Loader />
                                    </div>
                                ) :
                                    (
                                        <tr> <td colSpan="11" className="text-center py-6 text-gray-500"> No Data Found </td> </tr>
                                    )
                            )}
                        </tbody>

                    </table>

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                            {/* <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div> */}
                            <Loader />
                        </div>
                    )}
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
        </div>
    );
};

export default BinanceOrders;