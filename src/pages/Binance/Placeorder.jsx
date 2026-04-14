import React, { useState, useEffect } from "react";
import { placeTradeApi, getUserDashboardApi } from "../../ApiService/Adminapi";
import { FaBolt } from "react-icons/fa";

const PlaceTrade = () => {
  const [formData, setFormData] = useState({
    userId: "",
    pair: "SOLUSDT",
    amount: "",
    leverage: 1,
    mode: "LONG",
    confirm: false,
    autoClose: false,
    expiryMinutes: 10,
  });
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [result, setResult] = useState(null); 

  useEffect(() => {
    const fetchUser = async () => {
      if (!formData.userId) { setUserName(""); return; }
      setCheckingUser(true);
      try {
        const res = await getUserDashboardApi(formData.userId);
        setUserName(res?.data?.data?.user?.name || "User Found");
      } catch { setUserName("User not found"); }
      finally { setCheckingUser(false); }
    };
    const delay = setTimeout(fetchUser, 500);
    return () => clearTimeout(delay);
  }, [formData.userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (name === "userId" || name === "pair") newValue = value.toUpperCase();
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : newValue });
  };

  const handleAmountChange = (e) => {
    setFormData({ ...formData, amount: e.target.value.replace(/[^0-9]/g, "") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        userId: formData.userId,
        pair: formData.pair,
        amount: Number(formData.amount),
        leverage: Number(formData.leverage),
        mode: formData.mode,
        confirm: formData.confirm,
        autoClose: formData.autoClose,
      };
      if (formData.autoClose) payload.expiryMinutes = Number(formData.expiryMinutes);
      const res = await placeTradeApi(payload);
      setResult({ type: "success", message: res?.data?.message || "Trade placed successfully!" });
      setFormData({ userId: "", pair: "SOLUSDT", amount: "", leverage: 1, mode: "LONG", confirm: false, autoClose: false, expiryMinutes: 10 });
      setUserName("");
    } catch (err) { 
      let errMsg = err.response?.data?.message || err.message || "Failed to place trade";
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.msg) errMsg = parsed.msg;
      } catch (e) {}
      setResult({ type: "error", message: errMsg }); 
    }
    finally { setLoading(false); }
  };
  console.log(result)

  return (
    <div className="w-full flex justify-center font-poppins relative py-4">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="glass-panel p-5 rounded-2xl mb-6 flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaBolt className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Place Trade
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manually place a trade for a specific user</p>
          </div>
        </div>

        {/* Result Banner */}
        {result?.type === "success" && (
          <div className="mb-5 px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-semibold text-sm flex items-center gap-2 max-h-32 overflow-y-auto">
            ✅ {result.message}
          </div>
        )}
        {result?.type === "error" && (
          <div className="mb-5 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-semibold text-sm flex items-center gap-2 max-h-32 overflow-y-auto">
            ❌ {result.message}
          </div>
        )}

        {/* Form */}
        <div className="glass-panel p-2 sm:p-3 md:p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* USER ID */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">User ID</label>
              <div className="relative">
                <input type="text" name="userId" value={formData.userId} onChange={handleChange}
                  className="w-full px-4 py-3 pr-36 uppercase rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition"
                  placeholder="Enter User ID" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUser ? (
                    <span className="text-xs text-brand-gold animate-pulse">Checking...</span>
                  ) : userName ? (
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${userName.includes("not") ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {userName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* PAIR */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pair</label>
              <input type="text" name="pair" value={formData.pair} onChange={handleChange}
                className="px-4 py-3 uppercase rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-gold/50 transition" />
            </div>

            {/* LEVERAGE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Leverage</label>
              <input type="number" name="leverage" value={formData.leverage} onChange={handleChange}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-gold/50 transition" />
            </div>

            {/* AMOUNT */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount (%)</label>
              <div className="relative">
                <input type="text" value={formData.amount ? `${formData.amount}%` : ""} onChange={handleAmountChange}
                  placeholder="Enter %" className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 transition" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* MODE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, mode: "LONG" })}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.mode === "LONG" ? "bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"}`}>
                  📈 LONG
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, mode: "SHORT" })}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.mode === "SHORT" ? "bg-red-500/80 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"}`}>
                  📉 SHORT
                </button>
              </div>
            </div>

            {/* CONFIRM */}
            <div className="col-span-1 md:col-span-2 flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <p className="text-white text-sm font-semibold">Confirm Trade</p>
                <p className="text-gray-500 text-xs mt-0.5">You must confirm before placing trade</p>
              </div>
              <input type="checkbox" name="confirm" required checked={formData.confirm} onChange={handleChange}
                className="w-5 h-5 accent-[#d6a210] cursor-pointer scale-110" />
            </div>

            {/* SUBMIT */}
            <div className="col-span-1 md:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-brand-darker bg-gradient-to-r from-brand-gold to-yellow-400 hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 text-sm">
                {loading ? "Placing Trade..." : "⚡ Place Trade"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceTrade;