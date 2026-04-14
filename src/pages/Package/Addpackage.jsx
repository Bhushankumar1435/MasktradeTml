import React, { useState } from "react";
import { adminAddPackageApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import { FaBox, FaCheck } from "react-icons/fa";

const Addpackage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !validityDays) return toast.error("All fields are required");
    if (Number(price) <= 0) return toast.error("Price must be greater than 0");
    if (Number(validityDays) <= 0) return toast.error("Validity must be greater than 0");

    try {
      setLoading(true);
      const res = await adminAddPackageApi({
        name,
        price: Number(price),
        validityDays: Number(validityDays),
      });
      toast.success(res.data?.message || "Package added successfully!");
      setName("");
      setPrice("");
      setValidityDays("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center font-poppins relative py-4">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="glass-panel p-5 rounded-2xl mb-6 flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaBox className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Add Package
            </h1>
            <p className="text-gray-400 text-sm mt-1">Create a new subscription package</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Package Name</label>
              <input
                type="text"
                placeholder="e.g. 365 Days Premium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Price (₹)</label>
              <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Validity (Days)</label>
              <input
                type="number"
                placeholder="Enter validity in days"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition"
              />
            </div>

            {/* Preview row */}
            {(name || price || validityDays) && (
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Preview</p>
                {name && <p className="text-white"><span className="text-gray-500">Name:</span> {name}</p>}
                {price && <p className="text-emerald-400 font-semibold"><span className="text-gray-500">Price:</span> ₹{price}</p>}
                {validityDays && <p className="text-white"><span className="text-gray-500">Validity:</span> {validityDays} Days</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-brand-darker bg-gradient-to-r from-brand-gold to-yellow-400 hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 text-sm flex items-center justify-center gap-2"
            >
              {loading ? "Adding..." : <><FaCheck /> Add Package</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Addpackage;