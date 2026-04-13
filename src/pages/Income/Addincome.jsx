import React, { useState, useEffect } from "react";
import { addIncomeApi, getUserDashboardApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import { FaWallet, FaCheck } from "react-icons/fa";

const Addincome = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [checkingUser, setCheckingUser] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) { setUserName(""); return; }
      setCheckingUser(true);
      try {
        const res = await getUserDashboardApi(userId);
        setUserName(res?.data?.data?.user?.name || "User Found");
      } catch { setUserName("User not found"); }
      finally { setCheckingUser(false); }
    };
    const delay = setTimeout(fetchUser, 500);
    return () => clearTimeout(delay);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !amount) return toast.error("User ID & Amount are required");
    if (Number(amount) <= 0) return toast.error("Amount must be greater than 0");

    try {
      setLoading(true);
      const res = await addIncomeApi({ userId, amount: Number(amount) });
      toast.success(res.data?.message || "Income added successfully!");
      setUserId("");
      setAmount("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center font-outfit relative py-4">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-900/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="glass-panel p-5 rounded-2xl mb-6 flex items-center gap-4">
          <div className="p-2 border border-emerald-500/30 rounded-xl bg-emerald-500/10">
            <FaWallet className="text-emerald-400 text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Add Income
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manually credit income to a user account</p>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-5 px-5 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
          <p className="text-yellow-400 text-xs font-semibold">⚠️ This action will directly add income to the user's wallet. Please double-check before submitting.</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-2 sm:p-3 md:p-6 rounded-2xl relative overflow-hidden">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
              <div className="w-10 h-10 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">User ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 pr-36 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUser ? (
                    <span className="text-xs text-emerald-400 animate-pulse">Checking...</span>
                  ) : userName ? (
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${userName.includes("not") ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>{userName}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</label>
              <input
                type="number"
                placeholder="Enter amount to credit"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </div>

            {/* Preview */}
            {(userId || amount) && (
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Summary</p>
                {userId && <p className="text-white"><span className="text-gray-500">User ID:</span> {userId}</p>}
                {amount && <p className="text-emerald-400 font-semibold"><span className="text-gray-500">Credit:</span> {amount}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 text-sm flex items-center justify-center gap-2"
            >
              {loading ? "Adding..." : <><FaCheck /> Add Income</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Addincome;