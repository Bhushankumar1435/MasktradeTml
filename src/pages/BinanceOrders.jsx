import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllBinanceOrdersapi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

const BinanceOrders = () => {
    const { userId } = useParams();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async () => {
        try {
            setLoading(true);

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
        fetchOrders();
    }, [page, userId]);

    // ✅ PAGINATION NUMBERS (same logic)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 3;

        let start = Math.max(1, page - 1);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="w-full flex flex-col bg-[#0f172a] p-4 md:p-6 text-gray-200 rounded-md">

            {/* HEADER */}
            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-lg md:text-xl font-semibold text-white">
                    Binance Orders ({total})
                </h1>

                <span className="text-sm text-gray-400">
                    User ID: <span className="text-blue-400 font-semibold">{userId}</span>
                </span>
            </div>

            {/* TABLE */}
            <div className="bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="w-full overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm border-collapse">

                        <thead className="bg-[#1e293b] text-gray-400 uppercase border-b border-gray-700">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-700">#</th>
                                <th className="px-3 py-2 border-r border-gray-700">Order Id</th>
                                <th className="px-3 py-2 border-r border-gray-700">Pair</th>
                                <th className="px-3 py-2 border-r border-gray-700">Entry</th>
                                <th className="px-3 py-2 border-r border-gray-700">Current</th>
                                <th className="px-3 py-2 border-r border-gray-700">PNL</th>
                                <th className="px-3 py-2 border-r border-gray-700">PNL %</th>
                                <th className="px-3 py-2 border-r border-gray-700">QTY</th>
                                <th className="px-3 py-2 border-r border-gray-700">USED USDT</th>
                                <th className="px-3 py-2 border-r border-gray-700">Type</th>
                                <th className="px-3 py-2 border-r border-gray-700">TRADE ACTION</th>
                                <th className="px-3 py-2 border-r border-gray-700">Status</th>
                                <th className="px-3 py-2 border-r border-gray-700">Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((o, i) => (
                                    <tr key={i} className="text-center font-semibold hover:bg-[#1e293b]">

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

                                        <td
                                            className={`px-3 py-3 border border-gray-700 ${o.pnl < 0 ? "text-red-400" : "text-green-400"
                                                }`}
                                        >
                                            {o.pnl}
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
                                !loading && (
                                    <tr>
                                        <td colSpan="10" className="text-center py-6 text-gray-500">
                                            No orders found
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                </div>

                {/* ✅ PAGINATION SAME AS TRADE HISTORY */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3">

                        <span className="text-gray-400">
                            Page {page} of {totalPages}
                        </span>

                        <div className="flex gap-2 flex-wrap items-center">

                            <button disabled={page === 1} onClick={() => setPage(1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">First</button>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Prev</button>

                            {getPageNumbers().map(num => (
                                <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg ${page === num ? "bg-blue-500 text-white" : "bg-[#1e293b]"}`}
                                >
                                    {num}
                                </button>
                            ))}

                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Next</button>
                            <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40">Last</button>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BinanceOrders;