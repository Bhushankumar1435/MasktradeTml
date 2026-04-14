import React, { useEffect, useState } from "react";
import { getPackagesApi, updatePackageApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaBox, FaEdit, FaCheck } from "react-icons/fa";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackagesApi();
      if (res.data?.success) setPackages(res.data.packages || []);
    } catch (err) { toast.error(err?.response?.data?.message || `Failed to fetch packages`); }
    finally { setLoading(false); }
  };

  useEffect(() => { getPackages(); }, []);

  const handleUpdate = async () => {
    try {
      setActionLoading(true);
      const res = await updatePackageApi(editData._id, {
        name: editData.name,
        price: Number(editData.price),
        validityDays: Number(editData.validityDays),
      });
      toast.success(res.data?.message || "Updated successfully");
      setEditData(null);
      getPackages();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally { setActionLoading(false); }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
          <FaBox className="text-brand-gold text-xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            Package List
          </h1>
          <p className="text-gray-400 text-sm mt-1">{packages.length} packages</p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-20 relative z-10">
          <Loader />
        </div>
      )}

      {/* PACKAGES GRID */}
      {!loading && (
        <div className="relative z-10">
          {packages.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-gray-500 font-medium">No packages found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {packages.map((item) => (
                <div key={item._id}
                  className="glass-panel rounded-2xl p-5 border border-white/10 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden">
                  {/* Gold accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 mb-4 mx-auto">
                    <FaBox className="text-brand-gold text-xl" />
                  </div>

                  <h3 className="text-white font-bold text-center text-lg mb-3">{item.name}</h3>

                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="text-emerald-400 font-bold">₹{item.price}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Validity</span>
                      <span className="text-white font-semibold">{item.validityDays} Days</span>
                    </div>
                  </div>

                  <button onClick={() => setEditData(item)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold hover:text-yellow-300 rounded-xl text-sm font-semibold transition-all hover:shadow-glow-gold">
                    <FaEdit className="text-xs" /> Edit Package
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FaEdit className="text-brand-gold" /> Edit Package
              </h3>
              <button onClick={() => setEditData(null)} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>

            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Package Name</label>
            <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
              placeholder="Package Name" />

            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Price (₹)</label>
            <input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
              placeholder="Price" />

            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Validity (Days)</label>
            <input type="number" value={editData.validityDays} onChange={(e) => setEditData({ ...editData, validityDays: e.target.value })}
              className="w-full mb-5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
              placeholder="Validity Days" />

            <div className="flex gap-3">
              <button onClick={() => setEditData(null)}
                className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition">Cancel</button>
              <button onClick={handleUpdate} disabled={actionLoading}
                className="flex-1 py-2.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-darker rounded-xl text-sm font-bold transition-all shadow-glow-gold disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading ? "Saving..." : <><FaCheck /> Update</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;