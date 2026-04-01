import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'react-loading-skeleton/dist/skeleton.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import User from "./pages/Userdetails/Userlist";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import "./App.css";
import Layout from "./components/Layout";
import TicketHistory from "./pages/TicketHistory";
import AdminWalletAdd from "./pages/Wallet/adminwalletadd";
import Userwallettxnlist from "./pages/Wallet/Userwallettxnlist";
import Adminwallettxnlist from "./pages/Wallet/adminwallettxnlist";
import WalletDeduct from "./pages/Wallet/walletdeduct";
// import Addpackage from "./pages/Package/Addpackage";
import PackageList from "./pages/Package/PackageList";
import Addbanner from "./pages/Banner/Addbanner";
import BannerList from "./pages/Banner/Bannerlist";
import UserDashboard from "./pages/Userdetails/Userdashboard";
import WithdrawOrders from "./pages/WithdrawOrderhistory";
import Income from "./pages/Income/Incometxmlist";
import Addincome from "./pages/Income/Addincome";
import LevelReferrals from "./pages/Userdetails/LevelReferrals";
import BindUsers from "./pages/BindUsers";
import PaidUsers from "./pages/Userdetails/PaidUsers";
import PlaceTrade from "./pages/Binance/Placeorder";
import TradeHistory from "./pages/Binance/tradehistory";
import Opentrades from "./pages/Binance/Opentrades";
import CloseTrades from "./pages/Binance/Closetrades";
import BinanceOrders from "./pages/BinanceOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* PROTECTED + LAYOUT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route path="/" element={<Home />} />
            <Route path="/users" element={<User />} />
            <Route path="/bindUsers" element={<BindUsers />} />
            <Route path="/paidUsers" element={<PaidUsers />} />
            <Route path="/user-dashboard/:userId" element={<UserDashboard />} />
            <Route path="/level-referrals/:userId/:level" element={<LevelReferrals />} />
            <Route path="/withdrawhistory" element={<WithdrawOrders />} />
            <Route path="/ticketHistory" element={<TicketHistory />} />
            <Route path="/incometxnlist" element={<Income />} />
            <Route path="/addincome" element={<Addincome />} />
            <Route path="/addwallet" element={<AdminWalletAdd />} />
            <Route path="/userwallettxnlist" element={<Userwallettxnlist />} />
            <Route path="/adminwallettxnlist" element={<Adminwallettxnlist />} />
            <Route path="/walletdeduct" element={<WalletDeduct />} />
            {/* <Route path="/addpackage" element={<Addpackage />} /> */}
            <Route path="/packagelist" element={<PackageList />} />
            <Route path="/addbanner" element={<Addbanner />} />
            <Route path="/bannerList" element={<BannerList />} />
            <Route path="/placetrade" element={<PlaceTrade />} />
            <Route path="/tradehistory" element={<TradeHistory />} />
            <Route path="/opentrades" element={<Opentrades />} />
            <Route path="/closeTrades" element={<CloseTrades />} />
            <Route path="/binance-orders/:userId" element={<BinanceOrders />} />
          </Route>
        </Route>

      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </BrowserRouter>
  );
}

export default App;