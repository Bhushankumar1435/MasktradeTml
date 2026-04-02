import React, { useState, useEffect } from "react";
import { placeTradeApi, getUserDashboardApi } from "../../ApiService/Adminapi";

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

    // 🔥 Fetch user
    useEffect(() => {
        const fetchUser = async () => {
            if (!formData.userId) {
                setUserName("");
                return;
            }

            setCheckingUser(true);

            try {
                const res = await getUserDashboardApi(formData.userId);

                const user = res?.data?.data?.user;

                setUserName(user?.name || "User Found");

            } catch (err) {
                setUserName("User not found ❌");
            } finally {
                setCheckingUser(false);
            }
        };

        const delay = setTimeout(fetchUser, 500);
        return () => clearTimeout(delay);
    }, [formData.userId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleAmountChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        setFormData({ ...formData, amount: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       
        setLoading(true);


        try {

            let payload = {
                userId: formData.userId,
                pair: formData.pair,
                amount: Number(formData.amount),
                leverage: Number(formData.leverage),
                mode: formData.mode,
                confirm: formData.confirm,
                autoClose: formData.autoClose,
            };

            if (formData.autoClose) {
                payload.expiryMinutes = Number(formData.expiryMinutes);
            }

            await placeTradeApi(payload);

           alert("Trade has been placed successfully ✅");

            setFormData({
                userId: "",
                pair: "SOLUSDT",
                amount: "",
                leverage: 1,
                mode: "LONG",
                confirm: false,
                autoClose: false,
                expiryMinutes: 10,
            });

            setUserName("");

        } catch (error) {
            alert("Unable to place trade. Please try again ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center rounded-md items-center p-3 sm:p-5 md:p-10">

            <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-md border border-gray-700 text-white rounded-2xl shadow-2xl p-2 sm:p-4 md:p-6">

                <h2 className="text-2xl text-[#d6a210] font-semibold mb-6 text-center">
                    Place Trade
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* USER ID */}
                    <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                        <label className="font-semibold text-gray-400">User ID</label>

                        <div className="relative">
                            <input
                                type="text"
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                className="w-full p-3 pr-36 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769] outline-none transition"
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {checkingUser ? (
                                    <span className="text-xs text-yellow-400">
                                        Checking...
                                    </span>
                                ) : userName ? (
                                    <span className={`text-xs px-2 py-1 rounded ${userName.includes("not")
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-green-500/20 text-green-400"
                                        }`}>
                                        {userName}
                                    </span>
                                ) : null}
                            </div>
                        </div>


                    </div>

                    {/* PAIR */}
                    <div className="flex flex-col gap-2">
                        <label className=" font-semibold text-gray-400">Pair</label>
                        <input
                            type="text"
                            name="pair"
                            value={formData.pair}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769] outline-none transition"
                        />
                    </div>

                    {/* LEVERAGE */}
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-400">Leverage</label>
                        <input
                            type="number"
                            name="leverage"
                            value={formData.leverage}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769] outline-none transition"
                        />
                    </div>

                    {/* AMOUNT */}
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-400">Amount (%)</label>

                        <div className="relative">
                            <input
                                type="text"
                                value={formData.amount ? `${formData.amount}%` : ""}
                                onChange={handleAmountChange}
                                placeholder="Enter %"
                                className="w-full p-3 pr-12 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769] outline-none transition"
                            />

                            {/* % badge */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <span className="text-sm px-2 py-1 rounded bg-gray-600 text-gray-300">
                                    %
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MODE */}
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-400">Mode</label>

                        <div className="grid grid-cols-2 bg-gray-700 rounded-lg p-1">

                            {/* LONG */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, mode: "LONG" })}
                                className={`py-2 rounded-md text-sm font-medium transition-all ${formData.mode === "LONG"
                                    ? "bg-green-500 text-white shadow-md"
                                    : "text-gray-300 hover:bg-gray-600"
                                    }`}
                            >
                                📈 LONG
                            </button>

                            {/* SHORT */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, mode: "SHORT" })}
                                className={`py-2 rounded-md text-sm font-medium transition-all ${formData.mode === "SHORT"
                                    ? "bg-red-500 text-white shadow-md"
                                    : "text-gray-300 hover:bg-gray-600"
                                    }`}
                            >
                                📉 SHORT
                            </button>

                        </div>
                    </div>

                    {/* AUTO CLOSE */}
                    <div className="flex items-center justify-between bg-gray-700/70 border border-gray-600 p-3 rounded-xl">

                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                                Auto Close
                            </span>
                            <span className="text-xs text-gray-400">
                                Enable automatic trade closing
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            name="autoClose"
                            checked={formData.autoClose}
                            onChange={handleChange}
                            className="w-5 h-5 accent-blue-500 cursor-pointer"
                        />
                    </div>

                    {/* EXPIRY */}
                    {formData.autoClose && (
                        <div className="flex flex-col gap-2 bg-gray-700/50 border border-gray-600 p-4 rounded-xl">

                            <label className="text-sm text-gray-400">
                                Expiry Minutes
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    name="expiryMinutes"
                                    value={formData.expiryMinutes}
                                    onChange={handleChange}
                                    placeholder="Enter minutes"
                                    className="w-full p-3 pr-16 rounded-lg bg-gray-800 focus:ring-2 focus:ring-[#d3b769] outline-none transition"
                                />

                                {/* MIN BADGE */}
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                                    min
                                </span>
                            </div>

                        </div>
                    )}

                    {/* CONFIRM (MOVED TO BOTTOM) */}
                    <div className="flex items-center justify-between bg-gray-700/70 border border-gray-600 p-3 rounded-xl">

                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                                Confirm Trade
                            </span>
                            <span className="text-xs text-gray-400">
                                You must confirm before placing trade
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            name="confirm"
                            required
                            checked={formData.confirm}
                            onChange={handleChange}
                            className="w-5 h-5 accent-green-500 cursor-pointer scale-110"
                        />
                    </div>

                    {/* BUTTON */}
                    <div className="col-span-1 md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#d6a210] to-[#d3b769] hover:scale-[1.02] transition py-3 rounded-lg font-semibold"
                        >
                            {loading ? "Placing..." : "Place Trade"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PlaceTrade;