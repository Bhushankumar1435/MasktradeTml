import React, { useState } from "react";
import { adminWalletAddApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";

const AdminWalletAdd = () => {
    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId || !amount) {
            toast.error("All fields are required");
            return;
        }

        if (Number(amount) <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        try {
            setLoading(true);

            const res = await adminWalletAddApi({
                userId,
                amount: Number(amount),
            });

            toast.success(res.data?.message || "Wallet added successfully");

            setUserId("");
            setAmount("");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0f172a] flex items-center justify-center px-4 h-full">

            {/* CARD */}
            <div className="relative w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-6">

                {loading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
                        <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                <h2 className="text-xl font-semibold mb-5 text-[#d6a210] text-center">
                    Add Wallet Balance
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        type="text"
                        placeholder="Enter User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
                    />

                    <input
                        type="number"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-[#d6a210] to-[#d3b769] hover:scale-[1.02] transition p-2 rounded text-white font-semibold"
                    >
                        {loading ? "Adding..." : "Add Balance"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AdminWalletAdd;