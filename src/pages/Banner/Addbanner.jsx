import React, { useState } from "react";
import { toast } from "react-toastify";
import { addBannerApi } from "../../ApiService/Adminapi";

const Addbanner = () => {
    const [formData, setFormData] = useState({
        title: "",
        image: null,
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

            const data = new FormData();
            data.append("title", formData.title);
            data.append("ticketImage", formData.image);

            const res = await addBannerApi(data);

            if (res.data?.success) {
                toast.success(res.data.message || "Banner added");

                setFormData({
                    title: "",
                    image: null,
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
        <div className="h-full bg-[#0f172a] flex items-center justify-center px-4 rounded-md text-white">


            <div className="w-full max-w-4xl mx-auto bg-[#1e293b] rounded-xl shadow-lg p-2 md:p-4">

                <h2 className="text-lg md:text-2xl font-semibold text-[#d6a210] mb-4 md:mb-6">
                    Add Banner
                </h2>

                {/* 🔥 Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        image: e.target.files[0],
                                    })
                                }
                                className="w-full mt-1 p-2.5 rounded bg-[#020817] border border-gray-700"
                            />
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-[#d6a210] to-[#d3b769] hover:scale-[1.02] transition  p-2 rounded text-white font-semibold "

                        >
                            {loading ? "Adding..." : "Add Banner"}
                        </button>

                    </form>

                    {/* RIGHT - PREVIEW */}
                    <div className="flex flex-col gap-2">

                        {/* FIXED HEADER */}
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-400 uppercase text-xs tracking-wide">
                                Preview
                            </p>
                        </div>

                        {/* IMAGE BOX (SIZE FIXED) */}
                        <div className="w-full h-40 md:h-[216px] rounded-lg overflow-hidden border border-gray-700 bg-[#020817] flex items-center justify-center">

                            {formData.image ? (
                                <img
                                    src={URL.createObjectURL(formData.image)}
                                    alt="preview"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-500 text-sm">
                                    Image preview will appear here
                                </span>
                            )}

                        </div>

                        

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Addbanner;