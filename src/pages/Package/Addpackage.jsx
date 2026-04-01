import React, { useState } from "react";
import { adminAddPackageApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";

const Addpackage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!name || !price || !validityDays) {
      return toast.error("All fields are required");
    }

    if (Number(price) <= 0) {
      return toast.error("Price must be greater than 0");
    }

    if (Number(validityDays) <= 0) {
      return toast.error("Validity must be greater than 0");
    }

    try {
      setLoading(true);

      const res = await adminAddPackageApi({
        name,
        price: Number(price),
        validityDays: Number(validityDays),
      });

      toast.success(res.data?.message || "Package added successfully");

      // reset
      setName("");
      setPrice("");
      setValidityDays("");

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
      <div className="w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-6">

        <h2 className="text-xl font-semibold mb-5 text-white text-center">
          Add Package
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* NAME */}
          <input
            type="text"
            placeholder="Package Name (e.g. 365 Days)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
          />

          {/* PRICE */}
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
          />

          {/* VALIDITY */}
          <input
            type="number"
            placeholder="Validity (Days)"
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-gray-600 outline-none focus:border-blue-500"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 transition p-2 rounded text-white font-medium disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Package"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Addpackage;