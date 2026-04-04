import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPaidUsersApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";

const PaidUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showNoData, setShowNoData] = useState(false);
  const fetchPaidUsers = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
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
    const delay = setTimeout(() => {
      fetchPaidUsers();
    }, 200);
    const timer = setTimeout(() => {
      setShowNoData(true);
    }, 1000);
    return () => {
      clearTimeout(delay);
      clearTimeout(timer);
    };
  }, [page]);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (page > 4) {
        pages.push("...");
      }
      if (page > 3 && page < totalPages - 2) {
        pages.push(page);
      }
      if (page < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
          <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
            Paid Users ({total})
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">



        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 ">
          <table className="min-w-[800px] w-full text-sm border-collapse">

            <thead className="bg-gradient-to-r from-[#d6a210] to-[#d4b55e] text-white text-sm uppercase border-b border-[#d6a210]">
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
                  <tr key={item._id} className="text-center whitespace-nowrap font-semibold hover:bg-[#1e293b]">

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
                        ? new Date(item?.package.activationDate).toLocaleString()
                        : "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {item?.package.expiryDate
                        ? new Date(item?.package.expiryDate).toLocaleString()
                        : "___"}
                    </td>

                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">
                    {/* <div className="w-8 h-8 border-4 border-[#d6a210] border-t-transparent rounded-full animate-spin"></div> */}
                    <Loader />
                  </div>
                ) :
                  (
                    <tr> <td colSpan="11" className="text-center py-6 text-gray-500"> No Data Found </td> </tr>
                  )
              )}
            </tbody>

          </table>
          {/* ✅ NEW LOADER (same as transactions) */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">
              {/* <div className="w-8 h-8 border-4 border-[#d6a210] border-t-transparent rounded-full animate-spin"></div> */}
              <Loader />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

          {/* LEFT */}
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>

          {/* RIGHT (GROUP ALL BUTTONS) */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Previous */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ‹
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className=" text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={` flex items-center justify-center rounded-md text-sm font-semibold transition ${page === num
                    ? " text-[#d6a210]"
                    : "text-gray-300 hover:text-[#d3b769]"
                    }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ›
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PaidUsers;