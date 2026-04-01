import React, { useEffect, useState } from "react";
import {
  getPackagesApi,
  // deletePackageApi,
  updatePackageApi,
} from "../../ApiService/Adminapi";
import { toast } from "react-toastify";
import TableSkeleton from "../../components/ui/skeleton/tableskeleton";
import ListSkeleton from "../../components/ui/skeleton/Listskeleton";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackagesApi();

      if (res.data?.success) {
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPackages();
  }, []);

  // DELETE
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Delete this package?")) return;

  //   try {
  //     const res = await deletePackageApi(id);

  //     if (res.data?.success) {
  //       toast.success(res.data.message);

  //       setPackages((prev) =>
  //         prev.filter((pkg) => pkg._id !== id)
  //       );
  //     } else {
  //       toast.error(res.data.message);
  //     }
  //   } catch (err) {
  //     toast.error("Delete failed");
  //   }
  // };

  // UPDATE
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
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className=" bg-[#0f172a] text-white p-3 md:p-6 rounded-md">

      {/* HEADER */}
      <h2 className="text-lg md:text-2xl font-semibold mb-4">
        Packages ({packages.length})
      </h2>

      {/* LOADING */}


      {/* EMPTY */}
      {!loading && packages.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No packages found
        </div>
      )}

      {/* 📱 MOBILE CARD VIEW */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <ListSkeleton count={packages.length > 0 ? packages.length : 5} />
        ) : packages.length > 0 ? (
          packages.map((item) => (
            <div
              key={item._id}
              className="bg-[#1e293b] p-2 rounded-lg shadow flex flex-col gap-1"
            >
              <p className="text-sm">
                <span className="text-gray-400">Name:</span> {item.name}
              </p>

              <p className="text-sm">
                <span className="text-gray-400">Price:</span>{" "}
                <span className="text-green-400 font-medium">
                  {item.price}
                </span>
              </p>

              <p className="text-sm">
                <span className="text-gray-400">Validity:</span>{" "}
                {item.validityDays} Days
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditData(item)}
                  className="flex-1 py-1 bg-blue-600 rounded text-sm"
                >
                  Edit
                </button>

                {/* <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 py-1 bg-red-600 rounded text-sm"
                >
                  Delete
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No packages found</p>
        )}
      </div>

      {/* 💻 DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto border border-gray-700 rounded-lg">

        <table className="w-full text-sm">

          <thead className="bg-[#1e293b] text-gray-400">
            <tr>
              <th className="p-3 text-left text-base">Name</th>
              <th className="p-3 text-left text-base">Price</th>
              <th className="p-3 text-left text-base">Validity</th>
              <th className="p-3 text-center text-base">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : packages.length > 0 ? (
              packages.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-gray-700 font-semibold hover:bg-[#1e293b]"
                >
                  <td className="p-3">{item.name}</td>

                  <td className="p-3 text-green-400 ">
                    {item.price}
                  </td>

                  <td className="p-3">
                    {item.validityDays} Days
                  </td>

                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      onClick={() => setEditData(item)}
                      className="px-3 py-1 bg-blue-600 rounded text-sm"
                    >
                      Edit
                    </button>

                    {/* <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 bg-red-600 rounded text-sm"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No packages found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* ✏️ EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">

          <div className="bg-[#1e293b] p-5 md:p-6 rounded-xl w-full max-w-md">

            <h3 className="mb-4 text-lg font-semibold">
              Edit Package
            </h3>

            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full mb-3 p-2 bg-white/10 rounded"
            />

            <input
              type="number"
              value={editData.price}
              onChange={(e) =>
                setEditData({ ...editData, price: e.target.value })
              }
              className="w-full mb-3 p-2 bg-white/10 rounded"
            />

            <input
              type="number"
              value={editData.validityDays}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  validityDays: e.target.value,
                })
              }
              className="w-full mb-4 p-2 bg-white/10 rounded"
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

export default PackageList;