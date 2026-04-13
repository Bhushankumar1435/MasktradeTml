import React, { useEffect, useState } from "react";
import { getBannerListApi, deleteBannerApi, updateBannerApi } from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { FaImage, FaEdit, FaTrash } from "react-icons/fa";

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getBanners = async () => {
    try {
      setLoading(true);
      const res = await getBannerListApi();
      if (res.data?.success) setBanners(res.data?.data || []);
    } catch { toast.error("Failed to fetch banners"); }
    finally { setLoading(false); }
  };

  useEffect(() => { getBanners(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await deleteBannerApi(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } else { toast.error(res.data.message); }
    } catch { toast.error("Delete failed"); }
  };

  const handleUpdate = async () => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("title", editData.title);
      if (editData.imageFile) formData.append("ticketImage", editData.imageFile);
      const res = await updateBannerApi(editData._id, formData);
      toast.success(res.data?.message || "Updated successfully");
      setEditData(null);
      getBanners();
    } catch { toast.error("Update failed"); }
    finally { setActionLoading(false); }
  };

  const getImageUrl = (item) => {
    // Try all common field names the API might return for the banner image
    const img = item?.ticketImage || item?.imageUrl || item?.bannerImage || item?.image || "";
    if (!img) return "";
    if (img.startsWith("http")) return img;
    // Remove leading slash if present to avoid double-slash
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `https://api.robofict.mail-go.site/uploads/${cleanPath}`;
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-outfit relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
          <FaImage className="text-brand-gold text-xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
            Banner List
          </h1>
          <p className="text-gray-400 text-sm mt-1">{banners.length} banners</p>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex justify-center items-center py-20 relative z-10">
          <Loader />
        </div>
      )}

      {/* BANNER GRID */}
      {!loading && (
        <div className="relative z-10">
          {banners.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-gray-500 font-medium">
              No banners found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {banners.map((item) => (
                <div key={item._id}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-1 transition-transform group">
                  {/* Image */}
                  <div className="relative h-44 bg-white/5 overflow-hidden">
                    <img src={getImageUrl(item)} alt={item.title}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-semibold truncate mb-4">{item.title}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditData({ ...item, imageFile: null, preview: item.image })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold rounded-xl text-sm font-semibold transition-all">
                        <FaEdit className="text-xs" /> Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold transition-all">
                        <FaTrash className="text-xs" /> Delete
                      </button>
                    </div>
                  </div>
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
                <FaEdit className="text-brand-gold" /> Edit Banner
              </h3>
              <button onClick={() => setEditData(null)} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>

            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Title</label>
            <input value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
              placeholder="Banner title"
            />

            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Replace Image</label>
            <input type="file" accept="image/*"
              onChange={(e) => setEditData({ ...editData, imageFile: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]) })}
              className="w-full mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 file:bg-brand-gold/10 file:border-0 file:text-brand-gold file:rounded-lg file:px-3 file:py-1 file:mr-3 file:text-sm file:font-medium cursor-pointer"
            />

            <div className="w-full h-36 bg-white/5 border border-white/10 rounded-xl mb-5 overflow-hidden flex items-center justify-center">
              <img src={editData.imageFile ? editData.preview : getImageUrl(editData)}
                alt="" className="max-h-full object-contain" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditData(null)}
                className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition">Cancel</button>
              <button onClick={handleUpdate} disabled={actionLoading}
                className="flex-1 py-2.5 bg-brand-gold/90 hover:bg-brand-gold text-brand-darker rounded-xl text-sm font-bold transition-all shadow-glow-gold disabled:opacity-50">
                {actionLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;