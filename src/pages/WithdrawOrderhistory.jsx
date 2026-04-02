import React, { useEffect, useState } from "react";
import {
    getWithdrawOrdersApi,
    manageWithdrawApi,
} from "../ApiService/Adminapi";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";

const WithdrawOrders = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [remark, setRemark] = useState("");

    // Fetch
    const fetchWithdraws = async () => {
        try {
            setLoading(true);
            const res = await getWithdrawOrdersApi(page, limit, status, search);

            setData(res?.data?.data?.data || []);
            setTotal(res?.data?.data?.count || 0);
        } catch {
            toast.error("Failed to fetch withdraw orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchWithdraws();
        }, 500);

        return () => clearTimeout(delay);
    }, [page, status, search]);

    // Approve
    const handleApprove = async (id) => {
        const confirmApprove = window.confirm("Are you sure you want to approve this request?");

        if (!confirmApprove) return;

        try {
            await manageWithdrawApi({
                id,
                status: "APPROVED",
                remarks: "Approved",
            });

            toast.success("Approved");
            fetchWithdraws();
        } catch {
            toast.error("Error");
        }
    };

    // Reject
    const openRejectModal = (id) => {
        setSelectedId(id);
        setRemark("");
        setShowModal(true);
    };

    const submitReject = async () => {
        if (!remark.trim()) return toast.error("Enter remark");

        try {
            await manageWithdrawApi({
                id: selectedId,
                status: "REJECTED",
                remarks: remark,
            });

            toast.success("Rejected");
            setShowModal(false);
            fetchWithdraws();
        } catch {
            toast.error("Error");
        }
    };

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

    const copyText = async (text) => {
        if (!text) {
            toast.error("Nothing to copy");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    const truncateAddress = (address) => {
        if (!address) return "-";
        if (address.length <= 15) return address;

        return `${address.slice(0, 7)}.....${address.slice(-7)}`;
    };

    return (
        <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

            {/* Header */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4 mb-6">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-white">
                        Withdraw Orders ({total})
                    </h1>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search by User ID / Address"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-1.5 rounded bg-[#1e293b] border border-gray-600 text-sm"
                    />

                    {/* ALL */}
                    <button
                        onClick={() => {
                            setStatus("");
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded text-sm border font-semibold ${status === ""
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-[#1e293b] border-gray-600"
                            }`}
                    >
                        All
                    </button>

                    {/* PENDING */}
                    <button
                        onClick={() => {
                            setStatus("PENDING");
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-semibold ${status === "PENDING"
                            ? "bg-yellow-500 text-white"
                            : " text-white bg-yellow-500"
                            }`}
                    >
                        Pending
                    </button>

                    {/* APPROVED */}
                    <button
                        onClick={() => {
                            setStatus("APPROVED");
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-semibold ${status === "APPROVED"
                            ? "bg-green-700 text-white"
                            : " text-white  bg-green-500"
                            }`}
                    >
                        Approved
                    </button>

                    {/* REJECTED */}
                    <button
                        onClick={() => {
                            setStatus("REJECTED");
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-semibold ${status === "REJECTED"
                            ? "bg-red-700 text-white"
                            : "text-white  bg-red-500"
                            }`}
                    >
                        Rejected
                    </button>

                </div>
            </div>

            {/* Main */}
            <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

                {/* Loader */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* ✅ TABLE FOR ALL DEVICES */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">

                    <table className="min-w-[1000px] w-full text-sm border-collapse table-auto">

                        <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
                            <tr>
                                <th className="px-3 py-2 whitespace-nowrap">#</th>
                                <th className="px-3 py-2 whitespace-nowrap">User</th>
                                <th className="px-3 py-2 whitespace-nowrap">Amount</th>
                                <th className="px-3 py-2 whitespace-nowrap">Payable</th>
                                <th className="px-3 py-2 whitespace-nowrap">Address</th>
                                <th className="px-3 py-2 whitespace-nowrap">Remark</th>
                                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                                <th className="px-3 py-2 whitespace-nowrap">Action</th>
                                <th className="px-3 py-2 whitespace-nowrap">Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-[#1e293b] font-semibold text-center">

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {(page - 1) * limit + index + 1}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.userId}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.amount}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.payableAmount}
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 max-w-[200px]">
                                            <div className="flex items-center justify-center gap-2">

                                                <p
                                                    className="truncate max-w-[140px]"
                                                    title={item.address || "___"}
                                                >
                                                    {truncateAddress(item.address)}
                                                </p>

                                                {item.address && (
                                                    <button
                                                        onClick={() => copyText(item.address)}
                                                        className="flex items-center"
                                                    >
                                                        <FaCopy className="cursor-pointer text-gray-400 hover:text-blue-400 transition" />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                        <td className="px-3 py-3 border border-gray-700 max-w-[200px]">
                                            <p className="truncate" title={item.remarks || "-"}>
                                                {item.remarks || "___"}
                                            </p>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-white text-xs rounded ${item.status === "APPROVED"
                                                ? "bg-green-500"
                                                : item.status === "REJECTED"
                                                    ? "bg-red-500"
                                                    : "bg-yellow-500"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700">
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                <button
                                                    onClick={() => handleApprove(item._id)}
                                                    disabled={item.status !== "PENDING"}
                                                    className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700 disabled:opacity-40"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => openRejectModal(item._id)}
                                                    disabled={item.status !== "PENDING"}
                                                    className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700 disabled:opacity-40"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleString()
                                                : "N/A"}
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-6 text-gray-500">
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white w-full sm:w-[400px] rounded-t-2xl sm:rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            Enter Reject Remark
                        </h3>

                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="w-full border p-2 rounded mb-3 text-sm text-gray-900"
                            rows={4}
                        />

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-1 border rounded text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={submitReject}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawOrders;