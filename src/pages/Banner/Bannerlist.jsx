import React, { useEffect, useState } from "react";
import {
    getBannerListApi,
    deleteBannerApi,
    updateBannerApi,
} from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import TableSkeleton from "../../components/ui/skeleton/tableskeleton";
import ListSkeleton from "../../components/ui/skeleton/Listskeleton";

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const getBanners = async () => {
        try {
            setLoading(true);
            const res = await getBannerListApi();

            if (res.data?.success) {
                setBanners(res.data.banners || []);
            }
        } catch (err) {
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBanners();
    }, []);

    // DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to Delete this banner?")) return;

        try {
            const res = await deleteBannerApi(id);

            if (res.data?.success) {
                toast.success(res.data.message);
                setBanners((prev) => prev.filter((b) => b._id !== id));
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    // UPDATE
    const handleUpdate = async () => {
        try {
            setActionLoading(true);

            const res = await updateBannerApi(editData._id, {
                title: editData.title,
                image: editData.image,
            });

            toast.success(res.data?.message || "Updated");
            setEditData(null);
            getBanners();
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className=" bg-[#0f172a] text-white p-3 md:p-6 rounded-md">
            <div className="flex items-center gap-4 mb-6">
                <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
                <h2 className="text-lg md:text-2xl font-semibold ">
                    Banner List ({banners.length})
                </h2>
            </div>
            {/* 📱 MOBILE */}
            <div className="md:hidden flex flex-col gap-3">
                {loading ? (
                    <ListSkeleton count={5} />
                ) : banners.length > 0 ? (
                    banners.map((item) => (
                        <div key={item._id} className="bg-[#1e293b] p-4 rounded-lg">

                            <img
                                src={item.image}
                                alt=""
                                className="w-full h-40 object-contain mb-2 rounded"
                            />

                            <p className="text-sm">
                                <span className="text-gray-400">Title:</span> {item.title}
                            </p>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => setEditData(item)}
                                    className="flex-1 py-1 bg-blue-600 rounded text-sm"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="flex-1 py-1 bg-red-600 rounded text-sm"
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No banners found</p>
                )}
            </div>

            {/* 💻 DESKTOP */}
            <div className="hidden md:block overflow-x-auto border border-gray-700 rounded-lg mt-4">

                <table className="w-full text-sm table-fixed">

                    <thead className="bg-[#1e293b] text-gray-400">
                        <tr>
                            <th className="p-3 text-center w-1/4 text-base">Image</th>
                            <th className="p-3 text-center w-1/2 text-base">Title</th>
                            <th className="p-3 text-center w-1/4 text-base">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={5} columns={3} />
                        ) : banners.length > 0 ? (
                            banners.map((item) => (
                                <tr key={item._id} className="border-t font-semibold border-gray-700">

                                    {/* IMAGE */}
                                    <td className="p-3 align-middle text-center">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="h-16 object-contain mx-auto"
                                        />
                                    </td>

                                    {/* TITLE */}
                                    <td className="p-3 align-middle text-center ">
                                        {item.title}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-3 align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setEditData(item)}
                                                className="px-3 py-1 bg-[#d6a210] rounded text-sm "
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="px-3 py-1 bg-red-600 rounded text-sm "
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-gray-500">
                                    No banners found
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

            {/* ✏️ EDIT MODAL */}
            {editData && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">

                    <div className="bg-[#1e293b] p-5 rounded-xl w-full max-w-md">

                        <h3 className="mb-4 text-lg font-semibold">
                            Edit Banner
                        </h3>

                        <input
                            value={editData.title}
                            onChange={(e) =>
                                setEditData({ ...editData, title: e.target.value })
                            }
                            className="w-full mb-3 p-2 bg-white/10 rounded"
                        />

                        <input
                            value={editData.image}
                            onChange={(e) =>
                                setEditData({ ...editData, image: e.target.value })
                            }
                            className="w-full mb-3 p-2 bg-white/10 rounded"
                        />

                        <img
                            src={editData.image}
                            alt=""
                            className="w-full h-40  mb-3 rounded"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditData(null)}
                                className="flex-1 py-2 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-blue-600 rounded"
                            >
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