import React, { useEffect, useState } from "react";
import { getUsersApi } from "../../ApiService/Adminapi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../../components/ui/Loader";

const PAGE_SIZE = 10;

const User = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showNoData, setShowNoData] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getUsers = async () => {
    try {
      setLoading(true);
      setShowNoData(false);
      const res = await getUsersApi(page, PAGE_SIZE, search, formatDate(fromDate), formatDate(toDate));

      if (res.data?.success) {
        const data = res.data.data;

        setUserData(data?.users || []);
        setTotal(data?.pagination?.totalUsers || 0);
        setStats(data?.stats || {});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getUsers();
    }, 200);
    const timer = setTimeout(() => {
      setShowNoData(true);
    }, 1000);
    return () => {
      clearTimeout(delay);
      clearTimeout(timer);
    };
  }, [page, search, fromDate, toDate]);


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

  const exportAllUsersToExcel = async () => {
    try {
      setLoading(true);

      const res = await getUsersApi(1, 100000, search, formatDate(fromDate), formatDate(toDate));

      if (!res.data?.success) return;

      const users = res.data.data?.users || [];

      if (!users.length) return;

      const formattedData = users.map((user, index) => ({
        "Sr No": index + 1,
        Name: user.name || "N/A",
        "User ID": user.userId || "N/A",
        Sponsor: user.sponsorId || "N/A",
        Email: user.email || "N/A",
        Package: user.totalPackage || "N/A",
        Amount: user.pacageAmmount || "N/A",
        Balance: user.balance || "N/A",
        Expiry: user.expiryDate
          ? new Date(user.expiryDate).toLocaleDateString()
          : "N/A",
        Paid: user.paidStatus ? "Paid" : "Unpaid",
        Level: user.level || "N/A",
        Joined: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "All_Users.xlsx"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#0f172a] p-2 md:p-6 text-gray-200 rounded-md">

      {/* Header */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-4">
          <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />

          <h1 className="text-lg md:text-xl font-semibold text-[#d6a210]">
            Users List ({total})
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-3 items-center">

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-[180px] md:w-[220px] bg-[#1e293b] border border-gray-700 px-3 py-2 text-sm rounded-md"
          />

          <div className="flex gap-1 md:gap-2 w-full sm:w-auto">

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 sm:w-auto bg-[#1e293b] border border-gray-700 px-1 md:px-2 py-2 rounded text-sm text-white"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 sm:w-auto bg-[#1e293b] border border-gray-700 px-1 md:px-2 py-2 rounded text-sm text-white"
            />

          </div>

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearch("");
              setPage(1);
            }}
            className="w-full sm:w-auto bg-gray-600 px-3 py-2 rounded text-sm"
          >
            Reset
          </button>

          <button
            onClick={exportAllUsersToExcel}
            className="w-full sm:w-auto bg-green-600 px-3 py-2 rounded text-sm"
          >
            Export Data
          </button>

        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-[200px] bg-[#020817] rounded-lg border border-gray-700 flex flex-col overflow-hidden relative">

        {/* TABLE */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 ">

          <table className="min-w-[1100px] w-full text-sm border-collapse table-auto">
            <thead className="bg-gradient-to-r from-[#d6a210] to-[#d4b55e] text-white text-sm  whitespace-nowrap uppercase sticky top-0 border-b border-[#d6a210]">
              <tr>
                <th className="px-3 py-2 ">#</th>
                <th className="px-3 py-2 ">User</th>
                <th className="px-3 py-2 ">User ID</th>
                <th className="px-3 py-2 ">Sponsor</th>
                <th className="px-3 py-2 ">Email</th>
                <th className="px-3 py-2 ">Package</th>
                <th className="px-3 py-2 ">Amount</th>
                <th className="px-3 py-2 ">Balance</th>
                <th className="px-3 py-2 ">Expire</th>
                <th className="px-3 py-2 ">Paid</th>
                <th className="px-3 py-2 ">Level</th>
                <th className="px-3 py-2 ">Details</th>
                <th className="px-3 py-2 ">Joined</th>
              </tr>
            </thead>

            <tbody>
              {userData.length > 0 ? (
                userData.map((user, index) => (
                  <tr key={user._id || index} className="hover:bg-[#1e293b] font-semibold whitespace-nowrap transition text-center">

                    <td className="px-3 py-3 border border-gray-700">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.name || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.userId || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.sponsorId || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 max-w-[180px] truncate">
                      {user.email || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.totalPackage || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.pacageAmmount || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.balance || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.expiryDate
                        ? new Date(user.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <span className={`px-2 py-1 rounded text-xs ${user.paidStatus ? "bg-green-600" : "bg-red-600"}`}>
                        {user.paidStatus ? "Paid" : "Unpaid"}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.level || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      <button
                        onClick={() => navigate(`/user-dashboard/${user.userId}`)}
                        className="px-3 py-1 bg-[#d6a210] rounded text-sm hover:bg-[#ad8619]"
                      >
                        View
                      </button>
                    </td>

                    <td className="px-3 py-3 border border-gray-700">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "N/A"}
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

        {/* Pagination (UNCHANGED) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-3 py-3 border-t border-gray-700 text-sm gap-3 mt-3">
          <span className="text-gray-400 flex full justify-end">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center justify-end gap-2 w-full md:w-auto overflow-x-auto">

            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-600 rounded-md text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-40"
            >
              ‹
            </button>

            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className=" text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={` ${page === num
                    ? " text-[#d6a210]"
                    : "text-gray-300 hover:text-[#d3b769]"
                    }`}
                >
                  {num}
                </button>
              )
            )}

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

      {/* Stats Cards (UNCHANGED) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">

        <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Users</p>
          <h2 className="text-xl font-bold text-[#d6a210]">{stats.totalUsers}</h2>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Active Users</p>
          <h2 className="text-xl font-bold text-green-500">{stats.activeUsers}</h2>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Inactive Users</p>
          <h2 className="text-xl font-bold text-red-500">{stats.inactiveUsers}</h2>
        </div>

      </div>
    </div>
  );
};

export default User;