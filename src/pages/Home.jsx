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
    <div className="glass-panel text-white p-3 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-brand-gold opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="p-3 border border-brand-gold/30 rounded-2xl shadow-glow-gold/20 bg-brand-gold/5 backdrop-blur-md">
          <img className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md" src={"/Images/favicon.png"} alt="logo" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-400">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      <div className="relative">

        {/* LOADER */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md z-10">
            {/* <div className="w-10 h-10 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div> */}
            <Loader />

          </div>
        )}

        {/* 🔹 OLD CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* USERS */}
          <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_8px_30px_rgba(214,162,16,0.15)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold group-hover:scale-110 transition-transform shadow-glow-gold/20">
              <FaUsers className="text-2xl" />
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Users</p>
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stats.users}</h2>
              </div>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-gradient-to-r from-brand-gold to-yellow-400 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl block"></span>
          </div>

          {/* TRANSACTIONS */}
          <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <FaWallet className="text-2xl" />
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Transactions</p>
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stats.transactions}</h2>
              </div>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl block"></span>
          </div>

          {/* PACKAGES */}
          <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <FaBox className="text-2xl" />
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Packages</p>
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stats.packages}</h2>
              </div>
            </div>
            <span className="absolute left-0 bottom-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl block"></span>
          </div>

        </div>

        {/* 🔥 NEW EXTRA STATS */}
        {extraStats && (
          <div className="mt-10 space-y-10 relative z-10">

            {/* WITHDRAW */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-brand-gold rounded-full"></div>
                <h3 className="text-xl font-bold text-white tracking-wide">Withdraw Stats</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_5px_20px_rgba(20,184,166,0.1)] transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400 font-semibold tracking-wide text-sm uppercase">Total Withdraws</p>
                    <h2 className="text-2xl font-bold text-teal-400">{extraStats.withdraw.totalRequests}</h2>
                  </div>
                </div>

                <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_5px_20px_rgba(34,197,94,0.1)] transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400 font-semibold tracking-wide text-sm uppercase">Approved</p>
                    <h2 className="text-2xl font-bold text-green-400">{extraStats.withdraw.approvedRequests}</h2>
                  </div>
                </div>

                <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_5px_20px_rgba(234,179,8,0.1)] transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400 font-semibold tracking-wide text-sm uppercase">Pending</p>
                    <h2 className="text-2xl font-bold text-yellow-400">{extraStats.withdraw.pendingRequests}</h2>
                  </div>
                </div>
              </div>
            </div>


            {/* USERS STATS */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-white tracking-wide">Users Stats</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_5px_20px_rgba(34,197,94,0.1)] transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400 font-semibold tracking-wide text-sm uppercase">Active Users</p>
                    <h2 className="text-2xl font-bold text-green-400">{extraStats.users.activeUsers}</h2>
                  </div>
                </div>

                <div className="relative glass-panel p-6 rounded-2xl group hover:shadow-[0_5px_20px_rgba(239,68,68,0.1)] transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400 font-semibold tracking-wide text-sm uppercase">Inactive Users</p>
                    <h2 className="text-2xl font-bold text-red-400">{extraStats.users.inactiveUsers}</h2>
                  </div>
                </div>

              </div>
            </div>


            {/* PACKAGES */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-white tracking-wide">Package Stats</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {extraStats.packages.map((pkg, i) => (
                  <div key={i} className="glass-panel p-5 rounded-2xl group flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)] hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Amount</span>
                      <span className="text-lg font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">${pkg.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Users</span>
                      <span className="text-xl font-bold text-white tracking-wider">{pkg.totalUsers}</span>
                    </div>
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