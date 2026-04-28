import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserDashboardApi,
  getUserLevelViewApi,
  updateUserCredentialsApi,
} from "../../ApiService/Adminapi";
import Loader from "../../components/ui/Loader";
import {
  FaUser,
  FaArrowLeft,
  FaWallet,
  FaUsers,
  FaChartLine,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

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

/* ─── Credentials Modal ─────────────────────────────────────────────────── */
const CredentialsModal = ({ userId, currentEmail, currentName, currentPhone, onClose }) => {
  const [email, setEmail] = useState(currentEmail || "");
  const [newPassword, setNewPassword] = useState("");
  const [newname, setNewname] = useState(currentName || "");
  const [newphoneNumber, setNewphoneNumber] = useState(currentPhone || "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPass = newPassword.trim();
    const trimmedName = newname.trim();
    const trimmedPhone = newphoneNumber.trim();

    if (!trimmedEmail && !trimmedPass && !trimmedName && !trimmedPhone) {
      return showToast("error", "Please provide at least one field to update.");
    }

    setLoading(true);
    try {
      const payload = {};
      if (trimmedEmail) payload.email = trimmedEmail;
      if (trimmedPass) payload.newPassword = trimmedPass;
      if (trimmedName) payload.name = trimmedName;
      if (trimmedPhone) payload.phoneNumber = trimmedPhone;
      
      const res = await updateUserCredentialsApi(userId, payload);
      if (res.data?.success) {
        showToast("success", "Credentials updated successfully!");
        setTimeout(() => onClose(), 1800);
      } else {
        showToast("error", res.data?.message || "Update failed.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Try again.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: "linear-gradient(135deg,rgba(18,18,28,0.98),rgba(30,25,50,0.98))" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-gold/10 border border-brand-gold/30">
              <FaKey className="text-brand-gold text-lg" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Change Credentials</h2>
              <p className="text-gray-400 text-xs font-mono mt-0.5">{userId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border animate-pulse
              ${toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
            {toast.type === "success"
              ? <FaCheckCircle className="shrink-0" />
              : <FaExclamationTriangle className="shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Email Address
            </label>
            <input
              id="cred-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600
                focus:outline-none focus:border-brand-gold/50 focus:bg-white/8 transition-all"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              New Password
              <span className="ml-1 normal-case text-gray-600 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                id="cred-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-gray-600
                  focus:outline-none focus:border-brand-gold/50 focus:bg-white/8 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Full Name
              <span className="ml-1 normal-case text-gray-600 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              id="cred-name"
              type="text"
              value={newname}
              onChange={(e) => setNewname(e.target.value)}
              placeholder="Enter new name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600
                focus:outline-none focus:border-brand-gold/50 focus:bg-white/8 transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Phone Number
              <span className="ml-1 normal-case text-gray-600 font-normal">(leave blank to keep current)</span>
            </label>
            <input
              id="cred-phone"
              type="tel"
              value={newphoneNumber}
              onChange={(e) => setNewphoneNumber(e.target.value)}
              placeholder="Enter new phone number..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600
                focus:outline-none focus:border-brand-gold/50 focus:bg-white/8 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-gray-300 hover:text-white transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-400 text-black text-sm font-bold
                hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating…
                </>
              ) : (
                <>
                  <FaKey className="text-xs" /> Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const UserDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState([]);
  const [levelLoading, setLevelLoading] = useState(false);
  const [levelPage, setLevelPage] = useState(1);
  const [levelTotalPages, setLevelTotalPages] = useState(1);
  const LEVEL_LIMIT = 10;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCredModal, setShowCredModal] = useState(false);

  const getDashboard = async () => {
    try {
      setLoading(true);
      const res = await getUserDashboardApi(userId);
      if (res.data?.success) setData(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getLevelData = async (page = 1) => {
    try {
      setLevelLoading(true);
      const res = await getUserLevelViewApi(userId, page, LEVEL_LIMIT);
      if (res.data?.success) {
        setLevelData(res.data.data || []);
        const total = res.data.pagination?.totalPages || res.data.totalPages || 1;
        setLevelTotalPages(total);
      }
    } catch (err) { console.log(err); }
    finally { setLevelLoading(false); }
  };

  useEffect(() => { getDashboard(); getLevelData(1); setLevelPage(1); }, [userId]);

  const handleLevelPageChange = (page) => {
    setLevelPage(page);
    getLevelData(page);
  };

  const user = data?.user;
  const income = data?.income;
  const team = data?.team;
  const pkg = data?.package;

  const filteredLevels = levelData.filter(item => Number(item.level) > 0);

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
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <FaUser className="text-brand-gold" /> User Information
              </h3>
              {/* ── Change Credentials Button ── */}
              <button
                id="btn-change-credentials"
                onClick={() => setShowCredModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10
                  hover:bg-brand-gold/20 text-brand-gold hover:text-yellow-300 text-xs font-semibold transition-all
                  hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                <FaKey className="text-xs" /> Change Credentials
              </button>
            </div>
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
                          <td><span className="text-gray-500">{(levelPage - 1) * LEVEL_LIMIT + index + 1}</span></td>
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

              {/* PAGINATION */}
              {levelTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-xs text-gray-500">
                    Page <span className="text-white font-semibold">{levelPage}</span> of{" "}
                    <span className="text-white font-semibold">{levelTotalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLevelPageChange(levelPage - 1)}
                      disabled={levelPage <= 1 || levelLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5
                        hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      ← Prev
                    </button>

                    {/* Page number pills */}
                    {Array.from({ length: levelTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === levelTotalPages || Math.abs(p - levelPage) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="text-gray-600 text-xs px-1">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handleLevelPageChange(p)}
                            disabled={levelLoading}
                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                              ${ p === levelPage
                                ? "bg-brand-gold text-black border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                              } disabled:opacity-30`}>
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => handleLevelPageChange(levelPage + 1)}
                      disabled={levelPage >= levelTotalPages || levelLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5
                        hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      Next →
                    </button>
                  </div>
                </div>
              )}
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

      {/* CREDENTIALS MODAL */}
      {showCredModal && (
        <CredentialsModal
          userId={userId}
          currentEmail={user?.email || ""}
          currentName={user?.name || ""}
          currentPhone={user?.phoneNumber || ""}
          onClose={() => setShowCredModal(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;