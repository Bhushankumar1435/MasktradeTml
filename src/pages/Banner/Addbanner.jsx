import React, { useState } from "react";
import { toast } from "react-toastify";
import { addBannerApi } from "../../ApiService/Adminapi";
import { FaImage, FaUpload } from "react-icons/fa";

const Addbanner = () => {
  const [formData, setFormData] = useState({ title: "", image: null });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return toast.error("All fields are required");
    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("ticketImage", formData.image);
      const res = await addBannerApi(data);
      if (res.data?.success) {
        toast.success(res.data.message || "Banner added successfully!");
        setFormData({ title: "", image: null });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center font-outfit relative py-4">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="glass-panel p-5 rounded-2xl mb-6 flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaImage className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Add Banner
            </h1>
            <p className="text-gray-400 text-sm mt-1">Upload a new promotional banner</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 rounded-2xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT — FORM */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Banner Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter banner title"
                    value={formData.title}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Banner Image</label>
                  <label className="flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-brand-gold/40 transition cursor-pointer group">
                    <FaUpload className="text-gray-500 text-2xl group-hover:text-brand-gold transition" />
                    <span className="text-gray-500 text-sm group-hover:text-gray-300 transition">
                      {formData.image ? formData.image.name : "Click to upload image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-brand-darker bg-gradient-to-r from-brand-gold to-yellow-400 hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 text-sm mt-auto"
                >
                  {loading ? "Uploading..." : "🖼️ Add Banner"}
                </button>
              </div>

              {/* RIGHT — PREVIEW */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Preview</p>
                <div className="flex-1 min-h-[200px] rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="preview"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-center text-gray-600 p-6">
                      <FaImage className="text-4xl mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addbanner;