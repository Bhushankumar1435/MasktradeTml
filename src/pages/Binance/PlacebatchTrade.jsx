import React, { useState } from "react";
import { batchPlaceTradeApi } from "../../ApiService/Adminapi";

const PlacebatchTrade = () => {
  const [formData, setFormData] = useState({
    batchId: "",
    pair: "SOLUSDT",
    amount: "",
    leverage: 1,
    mode: "LONG",
    confirm: false,
    autoClose: false,
    expiryMinutes: 10,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = value;

    if (name === "batchId" || name === "pair") {
      newValue = value.toUpperCase();
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : newValue,
    });
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, amount: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batchId) {
      return alert("Enter Batch ID");
    }

    setLoading(true);

    try {
      let payload = {
        batchId: formData.batchId,
        pair: formData.pair,
        amount: Number(formData.amount),
        leverage: Number(formData.leverage),
        mode: formData.mode,
        confirm: formData.confirm,
      };

      if (formData.autoClose) {
        payload.expiryMinutes = Number(formData.expiryMinutes);
      }

      const res = await batchPlaceTradeApi(payload);

      alert("Batch Trade executed ✅");

      console.log(res.data);

      setFormData({
        batchId: "",
        pair: "SOLUSDT",
        amount: "",
        leverage: 1,
        mode: "LONG",
        confirm: false,
        autoClose: false,
        expiryMinutes: 10,
      });

    } catch (error) {
      alert("Failed to execute batch trade ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center p-3 sm:p-5 md:p-10 rounded-md">

      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-md border border-gray-700 text-white rounded-2xl shadow-2xl p-2 sm:p-4 md:p-6">

        <h2 className="text-2xl text-[#d6a210] font-semibold mb-6 text-center">
          Batch Place Trade
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* BATCH ID */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <label className="font-semibold text-gray-400">Batch ID</label>

            <input
              type="text"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              className="w-full p-3 uppercase rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769] outline-none"
            />
          </div>

          {/* PAIR */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-400">Pair</label>
            <input
              type="text"
              name="pair"
              value={formData.pair}
              onChange={handleChange}
              className="p-3 rounded-lg uppercase bg-gray-700 focus:ring-2 focus:ring-[#d3b769]"
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
              className="p-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769]"
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
                className="w-full p-3 pr-12 rounded-lg bg-gray-700 focus:ring-2 focus:ring-[#d3b769]"
              />
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

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "LONG" })}
                className={`py-2 rounded-md ${formData.mode === "LONG"
                    ? "bg-green-500"
                    : "text-gray-300"
                  }`}
              >
                📈 LONG
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "SHORT" })}
                className={`py-2 rounded-md ${formData.mode === "SHORT"
                    ? "bg-red-500"
                    : "text-gray-300"
                  }`}
              >
                📉 SHORT
              </button>

            </div>
          </div>

          {/* AUTO CLOSE */}
          <div className="flex items-center justify-between bg-gray-700/70 border border-gray-600 p-3 rounded-xl">
            <span>Auto Close</span>

            <input
              type="checkbox"
              name="autoClose"
              checked={formData.autoClose}
              onChange={handleChange}
              className="w-5 h-5 accent-[#d6a210]"
            />
          </div>

          {/* EXPIRY */}
          {formData.autoClose && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Expiry Minutes</label>

              <input
                type="number"
                name="expiryMinutes"
                value={formData.expiryMinutes}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-700"
              />
            </div>
          )}

          {/* CONFIRM */}
          <div className="flex items-center justify-between bg-gray-700/70 border border-gray-600 p-3 rounded-xl">
            <span>Confirm Trade</span>

            <input
              type="checkbox"
              name="confirm"
              required
              checked={formData.confirm}
              onChange={handleChange}
              className="w-5 h-5 accent-[#d6a210]"
            />
          </div>

          {/* BUTTON */}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d6a210] to-[#d3b769] py-3 rounded-lg font-semibold"
            >
              {loading ? "Placing..." : "Execute Batch Trade"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PlacebatchTrade;