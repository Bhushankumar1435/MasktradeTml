import React, { useEffect, useState } from "react";
import { getAllIncomeApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";

const Income = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    // ✅ Fetch
    const fetchIncome = async () => {
        try {
            setLoading(true);

            const res = await getAllIncomeApi(page, limit, search);

            setData(res?.data?.data || []);
            setTotal(res?.data?.total || 0);

        } catch (error) {
            toast.error("Failed to fetch income");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncome();
    }, [page, search]);

    // ✅ Pagination
    const totalPages = Math.ceil(total / limit);

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
        <div className="w-full flex flex-col bg-[#0f172a] p-3 md:p-6 text-gray-200 rounded-md">

            {/* Header */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4 ">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
                        Income History ({total})
                    </h1>
                </div>
                <input
                    type="text"
                    placeholder="Search by User ID..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full md:w-[250px] bg-[#1e293b] border border-gray-700 px-3 py-2 text-sm rounded-md outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />

            </div>

            {/* Container */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                {/* Loader */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                        {/* <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div> */}
                        <Loader />
                    </div>
                )}

                {/* TABLE (Mobile + Desktop) */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                    <table className="min-w-[700px] md:min-w-[900px] w-full text-sm border-collapse">

                        <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-700">#</th>
                                <th className="px-3 py-2 border-r border-gray-700">User</th>
                                <th className="px-3 py-2 border-r border-gray-700">Amount</th>
                                <th className="px-3 py-2 border-r border-gray-700">Type</th>
                                <th className="px-3 py-2 border-r border-gray-700">Description</th>
                                <th className="px-3 py-2 border-r border-gray-700">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-[#1e293b] font-semibold text-white text-center">

                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.userId}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            <span
                                                className={`px-2 py-1 rounded font-semibold ${item.amount > 0
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {item.amount}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.type || "-"}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 max-w-[200px]">
                                            <p
                                                className="truncate"
                                                title={item.description || "-"}
                                            >
                                                {item.description || "-"}
                                            </p>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleString()
                                                : "N/A"}
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

export default Income;