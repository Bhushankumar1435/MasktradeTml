import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDashboardApi, getUserLevelViewApi } from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import { FaUser, FaArrowLeft, FaWallet, FaUsers, FaChartLine } from "react-icons/fa";

const statFields = [
  { title: "Wallet Balance", key: "walletBalance", color: "text-brand-gold" },
  { title: "Total Income", key: "totalIncome", color: "text-emerald-400" },
  { title: "Total Withdraw", key: "totalWithdraw", color: "text-red-400" },
  { title: "Package Amount", key: "packageAmount", color: "text-blue-400" },
  { title: "Total Package", key: "totalPackage", color: "text-purple-400" },
  { title: "Team Business", key: "teamBusiness", color: "text-yellow-400" },
  { title: "Total Team", key: "totalTeam", color: "text-cyan-400" },
  { title: "Direct Users", key: "directUsers", color: "text-pink-400" },
  { title: "Fuel Balance", key: "fuelBalance", color: "text-orange-400" },
  { title: "Exchange Balance", key: "exchangeBalance", color: "text-teal-400" },
];

const UserDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState([]);
  const [levelLoading, setLevelLoading] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getDashboard = async () => {
    try {
      setLoading(true);
      const res = await getUserDashboardApi(userId);
      if (res.data?.success) setData(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getLevelData = async () => {
    try {
      setLevelLoading(true);
      const res = await getUserLevelViewApi(userId);
      if (res.data?.success) setLevelData(res.data.data || []);
    } catch (err) { console.log(err); }
    finally { setLevelLoading(false); }
  };

  useEffect(() => { getDashboard(); getLevelData(); }, [userId]);

  const user = data?.user;
  const income = data?.income;
  const team = data?.team;
  const pkg = data?.package;

  const filteredLevels = levelData.filter(item => Number(item.level) > 0 && Number(item.totalTeam) > 0);

  const stats = {
    walletBalance: user?.balance,
    totalIncome: income?.totalIncome,
    totalWithdraw: income?.totalWithdraw,
    packageAmount: pkg?.amount,
    totalPackage: pkg?.totalPackage,
    teamBusiness: team?.teamBusiness,
    totalTeam: team?.totalTeam,
    directUsers: team?.directUsers,
    fuelBalance: data?.fuelbalance?.balance,
    exchangeBalance: data?.exchange?.data?.available,
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col font-poppins relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-gold/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-brand-gold/30 rounded-xl bg-brand-gold/10">
            <FaUser className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400">
              User Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-mono">{userId}</p>
          </div>
        </div>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all self-start md:self-auto">
          <FaArrowLeft className="text-xs" /> Back
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-20 relative z-10">
          <Loader />
        </div>
      )}

      {/* CONTENT */}
      {!loading && user && (
        <div className="space-y-6 relative z-10">

          {/* USER INFO */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-5 flex items-center gap-2">
              <FaUser className="text-brand-gold" /> User Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                { label: "Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phoneNumber },
                { label: "Sponsor ID", value: user.sponsorId },
                { label: "Country", value: user.country },
                { label: "Level", value: user.level ?? "—" },
                { label: "Joined", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
                { label: "Expiry", value: user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : "N/A" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{item.label}</span>
                  <span className="text-white font-medium break-all">{item.value || "—"}</span>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Paid Status</span>
                <span className={`glass-badge self-start ${user.paidStatus ? "glass-badge-success" : "glass-badge-danger"}`}>
                  {user.paidStatus ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Status</span>
                <span className={`glass-badge self-start ${user.isBlocked ? "glass-badge-danger" : "glass-badge-success"}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <FaChartLine /> Stats Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {statFields.map((field, i) => (
                <div key={i}
                  className="glass-panel p-4 rounded-2xl border border-white/10 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{field.title}</p>
                  <p className={`text-xl font-bold ${field.color}`}>{stats[field.key] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* LEVEL TABLE */}
          {filteredLevels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <FaUsers /> Level View
              </h3>
              <div className="glass-table-container relative">
                <div className="w-full overflow-x-auto relative">
                  {levelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 backdrop-blur-md z-20">
                      <Loader />
                    </div>
                  )}
                  <table className="min-w-[600px] glass-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Level</th>
                        <th>Total Team</th>
                        <th className="text-center text-emerald-400">Active</th>
                        <th className="text-center text-red-400">Inactive</th>
                        <th>Business</th>
                        <th className="text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLevels.map((item, index) => (
                        <tr key={index}>
                          <td><span className="text-gray-500">{index + 1}</span></td>
                          <td><span className="text-blue-400 font-semibold">Level {item.level}</span></td>
                          <td className="text-white font-medium">{item.totalTeam}</td>
                          <td className="text-center text-emerald-400 font-semibold">{item.activeTeam}</td>
                          <td className="text-center text-red-400 font-semibold">{item.inactiveTeam}</td>
                          <td className="font-semibold text-brand-gold">₹{item.teamBusiness}</td>
                          <td className="text-center">
                            <button onClick={() => navigate(`/level-referrals/${userId}/${item.level}`)}
                              className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold hover:text-yellow-300 text-xs rounded-lg font-semibold transition-all hover:shadow-glow-gold">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !user && (
        <div className="glass-panel rounded-2xl p-12 text-center text-gray-500 font-medium relative z-10">
          No data found for this user.
        </div>
      )}
    </div>
  );
};

export default UserDashboard;