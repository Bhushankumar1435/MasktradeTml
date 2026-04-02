import React, { useEffect, useState } from "react";
import { getUsersApi } from "../../ApiService/Adminapi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const PAGE_SIZE = 10;

const User = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
      const res = await getUsersApi(page, PAGE_SIZE, search, formatDate(fromDate), formatDate(toDate));


      if (res.data?.success) {
        const data = res.data.data;

        setUserData(data?.users || []);
        setTotal(data?.pagination?.totalUsers || 0);

        // ✅ ADD THIS
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
    return new Date(date).toISOString().split("T")[0]; // ✅ 2026-03-25
  };

  useEffect(() => {
    getUsers();
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

      // ✅ API call with large limit (ALL DATA)
      const res = await getUsersApi(1, 100000, search, formatDate(fromDate), formatDate(toDate));


      if (!res.data?.success) return;

      const users = res.data.data?.users || [];

      if (!users.length) return;

      // ✅ Format data
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

      // ✅ Excel generate
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      worksheet["!cols"] = [
        { wch: 6 },   // Sr No
        { wch: 20 },  // Name
        { wch: 15 },  // User ID
        { wch: 15 },  // Sponsor
        { wch: 30 },  // Email
        { wch: 12 },  // Package
        { wch: 12 },  // Amount
        { wch: 12 },  // Balance
        { wch: 15 },  // Expiry
        { wch: 10 },  // Paid
        { wch: 10 },  // Level
        { wch: 15 },  // Joined
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
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-4">
          <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />

          <h1 className="text-lg md:text-xl font-semibold text-white">
            Users List ({total})
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">

          {/* Search */}
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
              placeholder="dd/mm/yyyy"
              className="w-1/2 sm:w-auto bg-[#1e293b] border border-gray-700 px-1 md:px-2 py-2 rounded text-sm text-white"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              placeholder="dd/mm/yyyy"
              className="w-1/2 sm:w-auto bg-[#1e293b] border placeholder-white border-gray-700 px-1 md:px-2 py-2 rounded text-sm text-white"
            />

          </div>
          {/* Reset */}
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

          {/* Export */}
          <button
            onClick={exportAllUsersToExcel}
            className="w-full sm:w-auto bg-green-600 px-3 py-2 rounded text-sm"
          >
            Export Data
          </button>

        </div>
      </div>



      {/* Main Container */}
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
                <th className="px-3 py-2 whitespace-nowrap">User</th>
                <th className="px-3 py-2 whitespace-nowrap">User ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Sponsor</th>
                <th className="px-3 py-2 whitespace-nowrap">Email</th>
                <th className="px-3 py-2 whitespace-nowrap">Package</th>
                <th className="px-3 py-2 whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 whitespace-nowrap">Balance</th>
                <th className="px-3 py-2 whitespace-nowrap">Expire</th>
                <th className="px-3 py-2 whitespace-nowrap">Paid</th>
                <th className="px-3 py-2 whitespace-nowrap">Level</th>
                <th className="px-3 py-2 whitespace-nowrap">Details</th>
                <th className="px-3 py-2 whitespace-nowrap">Joined</th>
              </tr>
            </thead>

            <tbody>
              {userData.length > 0 ? (
                userData.map((user, index) => (
                  <tr key={user._id || index} className="hover:bg-[#1e293b] font-semibold transition text-center">

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.name || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.userId || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.sponsorId || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 max-w-[180px] truncate">
                      {user.email || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.totalPackage || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.pacageAmmount || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.balance || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.expiryDate
                        ? new Date(user.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${user.paidStatus ? "bg-green-600" : "bg-red-600"
                          }`}
                      >
                        {user.paidStatus ? "Paid" : "Unpaid"}
                      </span>
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.level || "N/A"}
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/user-dashboard/${user.userId}`)}
                        className="px-3 py-1 bg-[#d6a210] rounded text-sm hover:bg-[#ad8619]"
                      >
                        View
                      </button>
                    </td>

                    <td className="px-3 py-3 border border-gray-700 whitespace-nowrap">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "N/A"}
                    </td>

                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="13" className="text-center py-6 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">

        <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Users</p>
          <h2 className="text-xl font-bold text-white">{stats.totalUsers}</h2>
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