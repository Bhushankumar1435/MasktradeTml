import React, { useEffect, useState } from "react";
import { getAllBatchesApi, batchPlaceTradeApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllBatches = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedBatch, setSelectedBatch] = useState(null);
    const totalPages = Math.ceil(total / limit);
    const [showNoData, setShowNoData] = useState(false);
    const navigate = useNavigate();

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setShowNoData(false);
            const res = await getAllBatchesApi(page, limit, search);

            setData(res?.data?.data || []);
            setTotal(res?.data?.total || 0);

        } catch {
            toast.error("Failed to fetch batches");
        } finally {
            setLoading(false);
            // setInitialLoading(false);
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


    const copyText = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };


    // PAGINATION
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
                <div className="flex items-center gap-4 ">
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
                        setPage(1); // 🔥 important
                    }}
                    className="px-3 py-2 rounded bg-[#1e293b] border border-gray-600 text-sm w-full md:w-64"
                />
            </div>

            {/* MAIN */}
            <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 ">

                    <table className="min-w-[900px] w-full text-sm border-collapse">
                        <thead className="bg-gradient-to-r from-[#d6a210] to-[#d3b769] text-white uppercase border-b border-[#d6a210]">
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Batch ID</th>
                                <th className="px-3 py-2">Users</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Created</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        className="text-center font-semibold hover:bg-[#1e293b] "

                                    >
                                        <td className="px-3 py-3 border border-gray-700">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 ">
                                            <div className="flex items-center justify-center gap-2">
                                                {item.batchId}
                                                <FaCopy onClick={(e) => { e.stopPropagation(); copyText(item.batchId); }}
                                                    className="cursor-pointer text-gray-400 hover:text-blue-400"
                                                />
                                            </div>
                                        </td>

                                        {/* USERS */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <button
                                                onClick={() => setSelectedBatch(item)}
                                                title={item.userIds.join(", ")}
                                                className="px-2 py-1 bg-[#d6a210] rounded text-xs hover:bg-[#ad8619] transition"
                                            >
                                                VIEW
                                            </button>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <span className="px-2 py-1 text-xs rounded bg-[#d6a210] text-white">
                                                {item.status}
                                            </span>
                                        </td>

                                        {/* DATE */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-3 py-3 border border-gray-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    navigate("/placeBatchTrade", {
                                                        state: { batchId: item.batchId }
                                                    });
                                                }}
                                                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                                            >
                                                Execute
                                            </button>
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

                    {/* LOADING */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                            {/* <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div> */}
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

            {/* MODAL */}
            {selectedBatch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-5 rounded w-[90%] max-w-md">
                        <h2 className="text-lg font-semibold mb-3">
                            Batch: {selectedBatch.batchId}
                        </h2>

                        <p className="mb-2 font-medium">Users:</p>

                        <div className="max-h-[200px] overflow-y-auto border p-2 rounded">
                            {selectedBatch.userIds.map((u, i) => (
                                <p key={i} className="text-sm">
                                    {u}
                                </p>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedBatch(null)}
                            className="mt-4 px-3 py-1 bg-gray-800 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllBatches;