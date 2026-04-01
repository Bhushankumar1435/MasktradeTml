import React, { useState } from "react";
import { addIncomeApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";

const Addincome = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !amount) {
      toast.error("User ID & Amount are required");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      const res = await addIncomeApi({
        userId,
        amount: Number(amount),
      });

      toast.success(res.data?.message || "Income added successfully");

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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 rounded-md">

      {/* CARD */}
      <div className="relative w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-6">

        {/* 🔥 OVERLAY LOADER (NO JUMP) */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
            <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-5 text-white text-center">
          Add Income
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
            className="bg-blue-600 hover:bg-blue-700 transition p-2 rounded text-white font-semibold disabled:opacity-50 active:scale-95"
          >
            {loading ? "Adding..." : "Add Income"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Addincome;