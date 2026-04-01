import React, { useEffect, useState } from "react";
import { getBindUsersApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import { getUserBalanceApi } from "../ApiService/Adminapi";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BindUsers = () => {

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [balanceData, setBalanceData] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const res = await getBindUsersApi(page, limit, "bind");

            if (res.data?.success) {
                const apiData = res.data.data;
                setData(apiData?.users || []);
                setTotal(apiData?.count || 0);
                setTotalPages(apiData?.totalPages || 1);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };


    const fetchBalance = async (userId) => {
        try {
            setBalanceLoading(true);

            const res = await getUserBalanceApi(userId);

            if (res.data?.success) {
                setBalanceData(res?.data?.data?.[0]?.availableBalance);
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch balance");
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);


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

            {/* HEADER + FILTER */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <h1 className="text-lg md:text-xl font-semibold text-white">
                    API Users ({total})
                </h1>


            </div>

            {/* TABLE */}
            <div className="bg-[#020817] rounded-lg border border-gray-700 overflow-hidden relative">

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className="w-10 h-10 border-4 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">

                        <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">User ID</th>
                                <th className="px-3 py-2">E-mail</th>
                                <th className="px-3 py-2">Balance</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Details</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item._id} className="text-center font-semibold hover:bg-[#1e293b]">

                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.name || "N/A"}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.userId || "N/A"}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.email || "N/A"}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">

                                            {selectedUserId === item.userId ? (

                                                balanceLoading ? (
                                                    <FaSyncAlt className="animate-spin text-blue-400 text-lg mx-auto" />
                                                ) : (
                                                    <span className="text-green-400 text-sm font-semibold">
                                                        {balanceData}
                                                    </span>
                                                )

                                            ) : (

                                                <button
                                                    onClick={() => {
                                                        setSelectedUserId(item.userId);
                                                        fetchBalance(item.userId);
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300"
                                                    title="Fetch Balance"
                                                >
                                                    <FaSyncAlt className="text-lg" />
                                                </button>

                                            )}

                                        </td>

                                        <td className="px-3 py-2 border border-gray-700">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${item.paidStatus
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                    }`}
                                            >
                                                {item.paidStatus ? "Paid" : "Unpaid"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            <button
                                                onClick={() => navigate(`/binance-orders/${item.userId}`)}
                                                className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-500">
                                            No data found
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3">

                        <span className="text-gray-400">
                            Page {page} of {totalPages}
                        </span>

                        <div className="flex gap-2 flex-wrap items-center">

                            {/* FIRST */}
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40"
                            >
                                First
                            </button>

                            {/* PREV */}
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40"
                            >
                                Prev
                            </button>

                            {/* PAGE NUMBERS */}
                            {getPageNumbers().map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg ${page === num
                                        ? "bg-blue-500 text-white"
                                        : "bg-[#1e293b]"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}

                            {/* NEXT */}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
                            >
                                Next
                            </button>

                            {/* LAST */}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(totalPages)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
                            >
                                Last
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BindUsers;