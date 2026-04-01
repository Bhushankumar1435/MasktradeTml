import React, { useEffect, useState } from "react";
import { getadminWalletListApi } from "../../ApiService/Adminapi";

const PAGE_SIZE = 10;

const Adminwallettxnlist = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getWallets = async () => {
    try {
      setLoading(true);
      const res = await getadminWalletListApi(page, PAGE_SIZE);

      if (res.data?.success) {
        setTransactions(res.data.transactions || []);
        setTotal(res.data.pagination?.totalRecords || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWallets();
  }, [page]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-3 md:p-6 text-gray-200 rounded-md">

      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg md:text-xl font-semibold text-white">
          Admin Wallet Transactions ({total})
        </h1>
      </div>

      {/* MAIN */}
      <div className="flex-1 bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* ✅ TABLE FOR ALL DEVICES */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">

          <table className="min-w-[1100px] w-full text-sm border-collapse table-auto">

            <thead className="bg-[#1e293b] text-gray-400 text-sm uppercase sticky top-0 border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">#</th>
                <th className="px-3 py-2 whitespace-nowrap">User ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Name</th>
                <th className="px-3 py-2 whitespace-nowrap">Email</th>
                <th className="px-3 py-2 whitespace-nowrap">Phone</th>
                <th className="px-3 py-2 whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 whitespace-nowrap">Type</th>
                <th className="px-3 py-2 whitespace-nowrap">Description</th>
                <th className="px-3 py-2 whitespace-nowrap">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <tr key={item._id} className="hover:bg-[#1e293b] font-semibold text-center">

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.userId}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.user?.name || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 max-w-[200px] truncate">
                      {item.user?.email || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {item.user?.phoneNumber || "___"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.amount >= 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        ₹ {item.amount}
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
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">

          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2 flex-wrap items-center">

            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
            >
              First
            </button>

            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-[#1e293b] disabled:opacity-40"
            >
              Prev
            </button>

            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1.5 rounded-lg ${
                  page === num
                    ? "bg-blue-600 text-white"
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
  );
};

export default Adminwallettxnlist;