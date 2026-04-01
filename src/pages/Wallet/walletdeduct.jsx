import React, { useState } from "react";
import { adminWalletDeductApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";

const WalletDeduct = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !amount) {
      return toast.error("All fields are required");
    }

    if (Number(amount) <= 0) {
      return toast.error("Amount must be greater than 0");
    }

    try {
      setLoading(true);

      const res = await adminWalletDeductApi({
        userId,
        amount: Number(amount),
      });

      toast.success(res.data?.message || "Amount deducted successfully");

      setUserId("");
      setAmount("");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 rounded-md">

      <div className="w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-6">

        <h2 className="text-xl font-semibold text-white mb-5 text-center">
          Deduct Wallet Balance
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* USER ID */}
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
          />

          {/* AMOUNT */}
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 transition p-2 rounded text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deduct Amount"}
          </button>

        </form>
      </div>

    </div>
  );
};

export default WalletDeduct;