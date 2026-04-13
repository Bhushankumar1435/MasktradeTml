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
    <div className="w-full h-full min-h-screen flex flex-col font-outfit relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl shadow-[0_0_15px_rgba(214,162,16,0.2)] bg-brand-gold/10">
            <img className="w-8 h-8 object-contain" src={"/Images/favicon.png"} alt="logo" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              Users List
            </h1>
            <p className="text-gray-400 text-sm mt-1 tracking-wide">Managing {total} total users</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-[200px] md:w-[240px] bg-white/5 border border-white/10 px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all text-white placeholder-gray-500 shadow-inner"
          />

          <div className="flex gap-2 w-full sm:w-auto">

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 sm:w-auto bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm text-gray-300 focus:border-brand-gold/50 outline-none hover:bg-white/10 transition-colors"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 sm:w-auto bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm text-gray-300 focus:border-brand-gold/50 outline-none hover:bg-white/10 transition-colors"
            />

          </div>

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearch("");
              setPage(1);
            }}
            className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Reset
          </button>

          <button
            onClick={exportAllUsersToExcel}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-400/20 px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
          >
            Export CSV
          </button>

        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-[400px] glass-table-container flex flex-col z-10">

        {/* TABLE */}
        <div className="w-full overflow-x-auto relative">

          <table className="min-w-[1100px] glass-table whitespace-nowrap">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>User ID</th>
                <th>Sponsor</th>
                <th>Email</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Expire</th>
                <th className="text-center">Paid</th>
                <th className="text-center">Level</th>
                <th className="text-center">Details</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {userData.length > 0 ? (
                userData.map((user, index) => (
                  <tr key={user._id || index}>

                    <td>
                      <span className="text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</span>
                    </td>
                    <td className="font-medium text-gray-200">
                      {user.name || "N/A"}
                    </td>
                    <td>
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-xs">{user.userId || "N/A"}</span>
                    </td>
                    <td className="text-brand-gold">
                      {user.sponsorId || "N/A"}
                    </td>
                    <td className="max-w-[180px] truncate text-white">
                      {user.email || "N/A"}
                    </td>
                    <td>
                      {user.totalPackage || "0"}
                    </td>
                    <td className="font-semibold text-emerald-400">
                      ${user.pacageAmmount || "0"}
                    </td>
                    <td className="font-semibold text-brand-gold">
                      ${user.balance || "0"}
                    </td>
                    <td className="text-gray-400">
                      {user.expiryDate
                        ? new Date(user.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="text-center">
                      <span className={`glass-badge ${user.paidStatus ? "glass-badge-success" : "glass-badge-danger"}`}>
                        {user.paidStatus ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="text-center font-bold">
                      {user.level || "N/A"}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/user-dashboard/${user.userId}`)}
                        className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold hover:text-yellow-300 rounded-lg text-xs font-semibold hover:shadow-glow-gold transition-all"
                      >
                        View
                      </button>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : "N/A"}
                    </td>

                  </tr>
                ))
              ) : (
                loading || !showNoData ? (
                  <tr>
                    <td colSpan="13" className="text-center py-12">
                      <span className="opacity-0">Loading...</span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center py-12 text-gray-500 font-medium"> No Data Found </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* TABLE LOADER OVERLAY */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 backdrop-blur-md z-20">
              <Loader />
            </div>
          )}

        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md text-sm gap-3">
          <span className="text-gray-400 font-medium">
             Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">

            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Prev
            </button>

            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={index} className="px-0.5 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(num)}
                  className={`px-0.5 py-0.5  font-semibold transition-all ${page === num
                    ? "text-brand-gold "
                    : "text-gray-400  hover:brand-gold  "
                    }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1.5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>

          </div>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 relative z-10">

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-brand-gold hover:-translate-y-1 transition-transform cursor-default group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Total Users</p>
          <h2 className="text-3xl font-bold text-white mt-1 drop-shadow-md">{stats.totalUsers}</h2>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform cursor-default group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Active Users</p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-1 drop-shadow-md">{stats.activeUsers}</h2>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-red-500 hover:-translate-y-1 transition-transform cursor-default group overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Inactive Users</p>
          <h2 className="text-3xl font-bold text-red-500 mt-1 drop-shadow-md">{stats.inactiveUsers}</h2>
        </div>

      </div>
    </div>
  );
};

export default User;