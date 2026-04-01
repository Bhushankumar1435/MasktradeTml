import React, { useState } from "react";
import { toast } from "react-toastify";
import { addBannerApi } from "../../ApiService/Adminapi";

const Addbanner = () => {
    const [formData, setFormData] = useState({
        title: "",
        image: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.image) {
            return toast.error("All fields are required");
        }

        try {
            setLoading(true);

            const res = await addBannerApi(formData);

            if (res.data?.success) {
                toast.success(res.data.message || "Banner added");

                setFormData({
                    title: "",
                    image: "",
                });
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
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 rounded-md text-white">


            <div className="w-full max-w-4xl mx-auto bg-[#1e293b] rounded-xl shadow-lg p-2 md:p-4">

                <h2 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">
                    Add Banner
                </h2>

                {/* 🔥 Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT - FORM */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-7">

                        {/* TITLE */}
                        <div>
                            <label className=" text-gray-400 font-semibold">Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter banner title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full mt-1 p-2.5 rounded bg-[#020817] border border-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* IMAGE */}
                        <div>
                            <label className=" text-gray-400 font-semibold">Image URL</label>
                            <input
                                type="text"
                                name="image"
                                placeholder="Enter image URL"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full mt-1 p-2.5 rounded bg-[#020817] border border-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add Banner"}
                        </button>

                    </form>

                    {/* RIGHT - PREVIEW */}
                    <div className="flex flex-col gap-1.5">

                        <p className="font-semibold text-gray-400">Preview</p>

                        {formData.image ? (
                            <div className="w-full h-40 md:h-56 flex items-center justify-center bg-[#020817] border border-gray-700 rounded-lg p-2">
                                <img
                                    src={formData.image}
                                    alt="preview"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-40 md:h-[216px] flex items-center justify-center bg-[#020817] border border-gray-700 rounded-lg text-gray-500 text-sm">
                                Image preview will appear here
                            </div>
                        )}

                        {formData.title && (
                            <p className="text-center text-sm mt-2 text-gray-300">
                                {formData.title}
                            </p>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Addbanner;