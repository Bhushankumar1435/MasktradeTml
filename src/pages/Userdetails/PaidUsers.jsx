import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPaidUsersApi } from "../../ApiService/Adminapi";

const PaidUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPaidUsers = async () => {
    try {
      setLoading(true);

      const res = await getPaidUsersApi(page, limit);

      setData(res?.data?.data?.users || []);
      setTotal(res?.data?.data?.count || 0);
      setTotalPages(res?.data?.data?.totalPages || 1);
    } catch {
      toast.error("Failed to fetch paid users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidUsers();
  }, [page]);

   const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold text-white">
          Paid Users ({total})
        </h1>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 relative">

        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm border-collapse">

            <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">#</th>
                <th className="px-3 py-2 whitespace-nowrap">Name</th>
                <th className="px-3 py-2 whitespace-nowrap">User ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Sponsor</th>
                <th className="px-3 py-2 whitespace-nowrap">Email</th>
                <th className="px-3 py-2 whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 whitespace-nowrap">Packages</th>
                <th className="px-3 py-2 whitespace-nowrap">Activation Date</th>
                <th className="px-3 py-2 whitespace-nowrap">Expiry Date</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item._id} className="text-center font-semibold hover:bg-[#1e293b]">

                    <td className="px-3 py-3 border border-gray-700 ">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item.name || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item.userId || "___"}
                    </td>

                     <td className="px-3 py-3 border border-gray-700">
                      {item.sponsorId || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item.email || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item?.package?.totalPackageAmount || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item?.package?.totalPackageCount || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item?.package.activationDate
                        ? new Date(item?.package.activationDate).toLocaleDateString()
                        : "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item?.package.expiryDate
                        ? new Date(item?.package.expiryDate).toLocaleDateString()
                        : "___"}
                    </td>

                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3">

            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2 flex-wrap items-center">

              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40"
              >
                First
              </button>

              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40"
              >
                Prev
              </button>

              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1.5 rounded-lg ${
                    page === num
                      ? "bg-blue-500 text-white"
                      : "bg-[#1e293b]"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
              >
                Next
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
              >
                Last
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaidUsers;