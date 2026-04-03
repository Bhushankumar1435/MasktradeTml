import React, { useEffect, useState } from "react";
import {
  getUsersApi,
  getWalletListApi,
  getPackagesApi,
  getdataApi,
} from "../ApiService/Adminapi";
import { FaUsers, FaWallet, FaBox } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../components/ui/Loader";

const Home = () => {
  const [stats, setStats] = useState({
    users: 0,
    transactions: 0,
    packages: 0,
  });

  const [extraStats, setExtraStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // OLD APIs
      const [usersRes, walletRes, packageRes] = await Promise.all([
        getUsersApi(1, 10, ""),
        getWalletListApi(1, 10, ""),
        getPackagesApi(),
      ]);

      setStats({
        users: usersRes.data?.data?.pagination?.totalUsers || 0,
        transactions: walletRes.data?.pagination?.totalRecords || 0,
        packages: packageRes.data?.packages?.length || 0,
      });

      // NEW API
      const newDataRes = await getdataApi();
      if (newDataRes.data?.success) {
        setExtraStats(newDataRes.data.data);
      } else {
        toast.error("Failed to fetch extra stats");
      }

    } catch (err) {
      console.log(err);
      toast.error("Dashboard fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className=" bg-[#0f172a] text-white p-2 md:p-4 rounded-md">
      <div className="flex items-center gap-4 mb-6">
        <img className="w-8 h-8 md:w-10 md:h-10" src={"/Images/favicon.png"} alt="logo" />
        <h1 className="text-xl md:text-2xl font-semibold text-[#d6a210]">
          Dashboard
        </h1>
      </div>

      <div className="relative">

        {/* LOADER */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md z-10">
            {/* <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div> */}
            <Loader />

          </div>
        )}

        {/* 🔹 OLD CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* USERS */}
          <div className="relative bg-[#1e293b] p-5 rounded-xl shadow group overflow-hidden hover:scale-[1.03] transition">
            <FaUsers className="text-[#d6a210] text-2xl mb-2" />
            <div className="flex items-center justify-between">
              <p className="text-gray-400 font-medium">Total Users</p>
              <h2 className="text-xl md:text-2xl font-bold">{stats.users}</h2>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-[#d6a210] w-0 group-hover:w-full transition-all"></span>
          </div>

          {/* TRANSACTIONS */}
          <div className="relative bg-[#1e293b] p-5 rounded-xl shadow group overflow-hidden hover:scale-[1.03] transition">
            <FaWallet className="text-[#d6a210] text-2xl mb-2" />
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Total Transactions</p>
              <h2 className="text-xl md:text-2xl font-bold">{stats.transactions}</h2>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-[#d6a210] w-0 group-hover:w-full transition-all"></span>
          </div>

          {/* PACKAGES */}
          <div className="relative bg-[#1e293b] p-5 rounded-xl shadow group overflow-hidden hover:scale-[1.03] transition">
            <FaBox className="text-[#d6a210] text-2xl mb-2" />
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Total Packages</p>
              <h2 className="text-xl md:text-2xl font-bold">{stats.packages}</h2>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-[#d6a210] w-0 group-hover:w-full transition-all"></span>
          </div>

        </div>

        {/* 🔥 NEW DATA */}
        {extraStats && (
          <div className="mt-6 space-y-6">

            {/* WITHDRAW */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Withdraw Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-400 font-semibold">Total Withdraws</p>
                    <h2 className="text-xl font-bold text-green-400">{extraStats.withdraw.totalRequests}</h2>
                  </div>
                  {/* <span className="absolute left-0 bottom-0 h-[3px] bg-green-500 w-0 group-hover:w-full transition-all"></span> */}
                </div>

                <div className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-400 font-semibold">Approved Withdraws</p>
                    <h2 className="text-xl font-bold text-green-400">{extraStats.withdraw.approvedRequests}</h2>
                  </div>
                  {/* <span className="absolute left-0 bottom-0 h-[3px] bg-green-500 w-0 group-hover:w-full transition-all"></span> */}
                </div>

                <div className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-400 font-semibold">Pending Withdraws</p>
                    <h2 className="text-xl font-bold text-yellow-400">{extraStats.withdraw.pendingRequests}</h2>
                  </div>
                  {/* <span className="absolute left-0 bottom-0 h-[3px] bg-yellow-500 w-0 group-hover:w-full transition-all"></span> */}
                </div>
              </div>
            </div>


            {/* USERS STATS */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Users Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-400 font-semibold">Active Users</p>
                    <h2 className="text-xl font-bold text-green-400">{extraStats.users.activeUsers}</h2>
                  </div>
                  {/* <span className="absolute left-0 bottom-0 h-[3px] bg-green-500 w-0 group-hover:w-full transition-all"></span> */}
                </div>

                <div className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-400 font-semibold">Inactive Users</p>
                    <h2 className="text-xl font-bold text-red-400">{extraStats.users.inactiveUsers}</h2>
                  </div>
                  {/* <span className="absolute left-0 bottom-0 h-[3px] bg-red-500 w-0 group-hover:w-full transition-all"></span> */}
                </div>

              </div>
            </div>


            {/* PACKAGES */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Package Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {extraStats.packages.map((pkg, i) => (
                  <div key={i} className="relative bg-[#1e293b] p-5 rounded-xl group overflow-hidden hover:scale-[1.03] transition">
                    <div className="flex flex-col gap-2">
                      <p className="text-blue-500 font-semibold flex justify-between"><span className="text-lg text-gray-500">Package Amount</span> {pkg.amount}</p>
                      <h2 className="text-green-500 font-semibold flex justify-between"><span className="text-lg text-gray-500">Users</span> {pkg.totalUsers} </h2>
                    </div>
                    {/* <span className="absolute left-0 bottom-0 h-[3px] bg-green-500 w-0 group-hover:w-full transition-all"></span> */}
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Home;