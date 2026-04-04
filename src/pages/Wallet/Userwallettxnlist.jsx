import React, { useEffect, useState } from "react";
import { getWalletListApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";

const PAGE_SIZE = 10;

const Userwallettxnlist = () => {
  const [wallets, setWallets] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNoData, setShowNoData] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getWallets = async () => {
    try {
      setLoading(true);
      setShowNoData(false);

      const res = await getWalletListApi(page, PAGE_SIZE, search);

      if (res.data?.success) {
        setWallets(res.data.wallets || []);
        setTotal(res.data.pagination?.totalRecords || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getWallets();
    }, 200);
    const timer = setTimeout(() => {
      setShowNoData(true);
    }, 1000);
    return () => {
      clearTimeout(delay);
      clearTimeout(timer);
    };
  }, [page, search]);

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
    <div className="w-full flex flex-col bg-[#0f172a] p-3 md:p-6 text-gray-200 rounded-md">

      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-4 ">
          <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
          <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
            Wallet Transactions ({total})
          </h1>
        </div>
        <input
          type="text"
          placeholder="Search userId..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-[250px] bg-[#1e293b] border border-gray-700 px-3 py-2 text-sm rounded-md outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">


        {/* ✅ TABLE FOR ALL DEVICES */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">


          <table className="min-w-[800px] w-full text-sm border-collapse table-auto">

            <thead className="bg-gradient-to-r from-[#d6a210] to-[#d4b55e] text-white text-sm uppercase sticky top-0 border-b border-[#d6a210]">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">#</th>
                <th className="px-3 py-2 whitespace-nowrap">User</th>
                <th className="px-3 py-2 whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 whitespace-nowrap">Type</th>
                <th className="px-3 py-2 whitespace-nowrap">Description</th>
                <th className="px-3 py-2 whitespace-nowrap">Date</th>
              </tr>
            </thead>

            <tbody>
              {wallets.length > 0 ? (
                wallets.map((item, index) => (
                  <tr key={item._id} className="hover:bg-[#1e293b] font-semibold text-center">

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.userId}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${item.amount >= 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {Math.floor(item.amount * 100000) / 100000}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.type}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 max-w-[250px]">
                      <p className="truncate" title={item.description}>
                        {item.description}
                      </p>
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
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

          {/* Loader */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/40 backdrop-blur-[1px]">

              {/* <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div> */}
              <Loader />
            </div>
          )}
        </div>
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
  );
};

export default Userwallettxnlist;