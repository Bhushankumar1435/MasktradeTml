import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDashboardApi, getUserLevelViewApi } from "../../ApiService/Adminapi";

// 🔥 Loader
const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const UserDashboard = () => {
  const { userId } = useParams();
  const [levelData, setLevelData] = useState([]);
  const [levelLoading, setLevelLoading] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getDashboard = async () => {
    try {
      setLoading(true);
      const res = await getUserDashboardApi(userId);

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboard();
    getLevelData();
  }, [userId]);

  const user = data?.user;
  const income = data?.income;
  const team = data?.team;
  const pkg = data?.package;


  const getLevelData = async () => {
    try {
      setLevelLoading(true);
      const res = await getUserLevelViewApi(userId);

      if (res.data?.success) {
        setLevelData(res.data.data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLevelLoading(false);
    }
  };

  const filteredLevels = levelData.filter(
    item => Number(item.level) > 0 && Number(item.totalTeam) > 0
  );


  return (
    <div className="relative  min-h-screen bg-[#0f172a] text-white p-4 md:p-6 rounded-md">

      {/* HEADER */}
      <h2 className="text-xl md:text-2xl font-semibold mb-5">
        User Dashboard ({userId})
      </h2>

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* DATA */}
      {!loading && user && (
        <div className="space-y-6">

          {/* 👤 USER INFO */}
          <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">User Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Name:</span> {user.name || "-"}
              </div>

              <div className="break-all font-semibold">
                <span className="text-gray-400 font-semibold">Email:</span> {user.email || "-"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Phone:</span> {user.phoneNumber || "-"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Sponsor ID:</span> {user.sponsorId || "-"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Country:</span> {user.country || "-"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Level:</span> {user.level ?? "-"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Paid Status:</span>{" "}
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-white text-xs ${user.paidStatus ? "bg-green-600" : "bg-red-600"
                    }`}
                >
                  {user.paidStatus ? "Paid" : "Unpaid"}
                </span>
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Status:</span>{" "}
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-white text-xs ${user.isBlocked ? "bg-red-600" : "bg-green-600"
                    }`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Joined:</span>{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>

              <div className="font-semibold">
                <span className="text-gray-400 font-semibold">Expiry:</span>{" "}
                {user.expiryDate
                  ? new Date(user.expiryDate).toLocaleDateString()
                  : "N/A"}
              </div>

            </div>
          </div>

          {/* 💰 WALLET + INCOME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Card title="Wallet Balance" value={user.balance} />
            <Card title="Total Income" value={income?.totalIncome} />
            <Card title="Total Withdraw" value={income?.totalWithdraw} />

            <Card title="Package Amount" value={pkg?.amount} />
            <Card title="Total Package" value={pkg?.totalPackage} />

            <Card title="Team Business" value={team?.teamBusiness} />
            <Card title="Total Team" value={team?.totalTeam} />
            <Card title="Direct Users" value={team?.directUsers} />

            <Card title="Fuel Balance" value={data?.fuelbalance?.balance} />
            <Card title="Exchange Balance" value={data?.exchange?.data?.available} />

          </div>

        </div>
      )}

      {/* EMPTY */}
      {!loading && !user && (
        <p className="text-center text-gray-500">No data found</p>
      )}

      {/* 🔽 LEVEL VIEW TABLE */}
      {filteredLevels.length > 0 && (
        <div className="bg-[#020817] border border-gray-700 rounded-xl mt-6 overflow-hidden">

          <h3 className="text-lg font-semibold p-4 border-b border-gray-700">
            Level View
          </h3>

          <div className="relative">
            {levelLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#020817]/60 backdrop-blur-sm z-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center min-w-[600px]">

                <thead className="bg-[#1e293b] text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 border border-gray-700">#</th>
                    <th className="px-3 py-2 border border-gray-700">Level</th>
                    <th className="px-3 py-2 border border-gray-700">Total Team</th>
                    <th className="px-3 py-2 border border-gray-700">Active</th>
                    <th className="px-3 py-2 border border-gray-700">Inactive</th>
                    <th className="px-3 py-2 border border-gray-700">Business</th>
                    <th className="px-3 py-2 border border-gray-700">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLevels.map((item, index) => (
                    <tr key={index} className="font-semibold hover:bg-[#1e293b]">

                      <td className="px-3 py-2 border border-gray-700">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 border border-gray-700 text-blue-400">
                        Level {item.level}
                      </td>

                      <td className="px-3 py-2 border border-gray-700">
                        {item.totalTeam}
                      </td>

                      <td className="px-3 py-2 border border-gray-700 text-green-400">
                        {item.activeTeam}
                      </td>

                      <td className="px-3 py-2 border border-gray-700 text-red-400">
                        {item.inactiveTeam}
                      </td>

                      <td className="px-3 py-2 border border-gray-700 text-yellow-400">
                        ₹ {item.teamBusiness}
                      </td>

                      <td className="px-3 py-2 border border-gray-700">
                        <button
                          onClick={() => navigate(`/level-referrals/${userId}/${item.level}`)}
                          className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
                        >
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

  );
};

// 🔥 CARD
const Card = ({ title, value }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-4 shadow-md transition-all duration-300 hover:scale-[1.04] hover:shadow-blue-500/20 group">

      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-500/10 blur-2xl transition duration-300"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">

        {/* Title */}
        <p className="text-gray-400 text-xs sm:text-sm tracking-wide font-semibold">
          {title}
        </p>

        {/* Value */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 break-words">
          {value ?? 0}
        </h3>

      </div>

      {/* Bottom Line Animation */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-300"></div>

    </div>
  );
};

export default UserDashboard;