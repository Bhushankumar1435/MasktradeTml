import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReferralByLevelApi } from "../../ApiService/Adminapi";

const PAGE_SIZE = 10;

const LevelReferrals = () => {
    const { userId, level } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchReferrals = async () => {
        try {
            setLoading(true);

            const res = await getReferralByLevelApi(userId, level, page, PAGE_SIZE);

            if (res.data?.success) {
                setData(res.data.data || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [userId, level, page]);

    useEffect(() => {
        setPage(1);
    }, [level]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

            {/* HEADER */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h1 className="text-lg md:text-xl font-semibold text-white">
                    Level {level} Referrals ({total})
                </h1>

                <button
                    onClick={() => navigate(-1)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                    ← Back
                </button>
            </div>

            {/* MAIN CONTAINER */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                {/* Loader */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* ✅ TABLE FOR ALL DEVICES */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">

                    <table className="min-w-[900px] w-full text-sm border-collapse table-auto">

                        <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
                            <tr>
                                <th className="px-3 py-3 whitespace-nowrap">#</th>
                                <th className="px-3 py-3 whitespace-nowrap">User ID</th>
                                <th className="px-3 py-3 whitespace-nowrap">Name</th>
                                <th className="px-3 py-3 whitespace-nowrap">Sponsor</th>
                                <th className="px-3 py-3 whitespace-nowrap">Package</th>
                                <th className="px-3 py-3 whitespace-nowrap">Status</th>
                                <th className="px-3 py-3 whitespace-nowrap">Joined</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item._id || index} className="hover:bg-[#1e293b] font-semibold text-center">

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {(page - 1) * PAGE_SIZE + index + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.userId}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.name}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.sponsorId}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.package}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${item.status === "ACTIVE"
                                                        ? "bg-green-600"
                                                        : "bg-red-600"
                                                    }`}
                                            >
                                                {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.activationDate && item.activationDate !== "0000-00-00"
                                                ? new Date(item.activationDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-gray-500">
                                            No data found
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                </div>

                {/* 🔽 PAGINATION */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3">

                        <span className="text-gray-400">
                            Page {page} of {totalPages}
                        </span>

                        <div className="flex gap-2 flex-wrap items-center">

                            <button
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-gray-300 disabled:opacity-40"
                            >
                                First
                            </button>

                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-gray-300 disabled:opacity-40"
                            >
                                Prev
                            </button>

                            {getPageNumbers().map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg ${page === num
                                            ? "bg-blue-600 text-white"
                                            : "bg-[#1e293b] text-gray-300 hover:bg-[#334155]"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-gray-300 disabled:opacity-40"
                            >
                                Next
                            </button>

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(totalPages)}
                                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-gray-300 disabled:opacity-40"
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

export default LevelReferrals;