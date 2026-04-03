import React, { useEffect, useState } from "react";
import { getBindUsersApi } from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import { getUserBalanceApi } from "../ApiService/Adminapi";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

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

            {/* HEADER + FILTER */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4 ">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
                        API Users ({total})
                    </h1>
                </div>

            </div>

            {/* TABLE */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 relative">

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
                                                    <FaSyncAlt className="animate-spin text-[#d6a210] text-lg mx-auto" />
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
                                                    className="text-[#d6a210] hover:text-[#ddac24]"
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
                                                className="px-3 py-1 bg-[#d6a210] rounded text-sm hover:bg-[#ebb318]"
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
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            {/* <div className="w-10 h-10 border-4 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div> */}
                            <Loader />
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
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

export default BindUsers;