import React, { useState } from "react";
import { createBatchApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";

const CreateBatch = () => {
    const [userIds, setUserIds] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // handle change
    const handleChange = (index, value) => {
        if (value.length > 5) return;

        const updated = [...userIds];
        updated[index] = value.toUpperCase();
        setUserIds(updated);
    };

    // add input
    const addInput = () => {
        setUserIds([...userIds, ""]);
    };

    // remove input
    const removeInput = (index) => {
        if (userIds.length === 1) return;
        const updated = userIds.filter((_, i) => i !== index);
        setUserIds(updated);
    };

    // submit
    const handleSubmit = async () => {
        const filtered = userIds.filter((id) => id.trim() !== "");

        if (filtered.length === 0) {
            return toast.error("Enter at least one User ID");
        }

        try {
            setLoading(true);

            const res = await createBatchApi({
                userIds: filtered,
            });

            setResult(res.data);
            toast.success("Batch Created");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-h-[2000vh] flex bg-[#0f172a] p-3 sm:p-6 text-white overflow-hidden rounded-md">

            <div className="w-full  bg-[#020817] p-2 sm:p-6 rounded-lg border border-gray-700">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-4">
                    <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                    <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
                        Create Batch
                    </h1>
                </div>

                {/* GRID INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {userIds.map((id, index) => (
                        <div key={index} className="flex items-center gap-2 w-full">

                            <input
                                type="text"
                                value={id}
                                placeholder="User ID"
                                onChange={(e) => handleChange(index, e.target.value)}
                                className="w-full px-3 py-2 rounded bg-[#1e293b] border border-gray-600 text-sm"
                            />

                            {/* REMOVE BUTTON */}
                            {userIds.length > 1 && (
                                <button
                                    onClick={() => removeInput(index)}
                                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
                    {/* ADD */}
                    <button
                        onClick={addInput}
                        className="w-full sm:w-auto px-3 py-2 bg-green-600 rounded hover:bg-green-700"
                    >
                        + Add
                    </button>

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-44 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Batch"}
                    </button>

                </div>
                {/* RESULT */}
                {result && (
                    <div className="mt-6 p-4 bg-[#020817] border border-gray-700 rounded">
                        <p><b>Message:</b> {result.message}</p>
                        <p><b>Batch ID:</b> {result.batchId}</p>
                        <p><b>Total Users:</b> {result.totalUsers}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateBatch;