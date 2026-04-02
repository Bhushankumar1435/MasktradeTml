import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../ApiService/axios";
import { OTPInput } from "../components/ui/SixDigitotp";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginImg from "../Images/main.png";
import { resendOtpApi } from "../ApiService/Adminapi";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpScreen, setOtpScreen] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await api.post("/admin/signin", { email, password });
      toast.success(res.data.message);

      if (res.data.success) {
        setOtpScreen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/admin/verifySignin", {
        email,
        otp: String(otp),
      });

      toast.success(res.data.message);

      if (res.data.success) {
        localStorage.setItem("admin_token", res.data.data);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    otpScreen ? handleVerifyOtp() : handleLogin();
  };

  const handleResendOtp = async () => {
    try {
      const res = await resendOtpApi(email);
      toast.success(res.data.message || "OTP resent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-4">

      <div className="flex w-full max-w-5xl h-[430px] md:h-[480px] bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-[#0f172a] p-6">
          <img
            src={loginImg}
            alt="login"
            className="h-[300px] object-contain"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 text-white">

          <form onSubmit={handleSubmit} className="flex flex-col">

            {!otpScreen ? (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-8">
                  Welcome Back
                </h1>

                <div className="flex flex-col gap-6">

                  {/* EMAIL */}
                  <div>
                    <label className="text-sm mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="text-sm mb-2 block">Password</label>
                    <div className="flex items-center bg-white rounded-xl px-3">
                      <input
                        type={view ? "text" : "password"}
                        placeholder="Enter password"
                        className="w-full py-3 bg-white/20 outline-none text-black"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setView(!view)}
                        className="cursor-pointer text-xl text-gray-600 hover:text-black transition"
                      >
                        {view ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="mt-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition"
                >
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-8">
                  Verify OTP 🔐
                </h1>

                <OTPInput setOtp={setOtp} />

                <button
                  type="submit"
                  className="mt-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition"
                >
                  Verify OTP
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="mt-3 text-sm text-blue-400 hover:underline"
                >
                  Resend OTP
                </button>
              </>
            )}

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;