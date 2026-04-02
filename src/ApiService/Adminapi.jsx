// adminApi.js

import api from "./axios";

// AUTH
export const adminLogin = (data) =>
  api.post("/admin/signin", data);

export const resendOtpApi = (email) => {
  return api.post("/admin/resendOtp", { email });
};

// USERS
export const getUsersApi = (
  page = 1,
  limit = 10,
  search = "",
  fromDate = "",
  toDate = ""
) => {
  let url = `/admin/users?page=${page}&limit=${limit}&search=${search}`;

  if (fromDate) url += `&fromDate=${fromDate}`;
  if (toDate) url += `&toDate=${toDate}`;

  return api.get(url);
};

// AUTH
export const adminLogoutApi = () => {
  return api.post("/admin/logout");
};

export const getdataApi = () => {
  return api.get("admin/adminStats");
};

export const getPaidUsersApi = (page = 1, limit = 10) => {
  return api.get(
    `/admin/paidUsersDashboard?page=${page}&limit=${limit}`
  );
};


//////////// TICKETS /////////////////////

export const GetAdminTicketHistoryApi = (page = 1, limit = 10) => {
  return api.get(`/admin/ticketHistory?page=${page}&limit=${limit}`);
};
// ✅ FETCH tickets (GET)
export const ManageAdminTicketApi = (data) => {
  return api.post("/admin/manageTicket", data);
};

/////////// WALLET /////////////////////

export const adminWalletAddApi = (data) => {
  return api.post("/admin/wallet/add", data);
};

export const getWalletListApi = (page = 1, limit = 10, search = "") => {
  return api.get(
    `/admin/wallet/list?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getadminWalletListApi = (page = 1, limit = 10) => {
  return api.get(
    `/admin/wallet/admin-transactions?page=${page}&limit=${limit}`
  );
};

export const adminWalletDeductApi = (data) => {
  return api.post("/admin/wallet/deduct", data);
};


///////////// PACKAGE ////////////////////

// GET
export const getPackagesApi = () => {
  return api.get("/admin/packages");
};

// ADD 
export const adminAddPackageApi = (data) => {
  return api.post("/admin/package/add", data);
};

// UPDATE
export const updatePackageApi = (id, data) => {
  return api.put(`/admin/package/update/${id}`, data);
};

// DELETE
export const deletePackageApi = (id) => {
  return api.delete(`/admin/package/delete/${id}`);
};



////////// BANNER ////////////////

export const addBannerApi = (data) => {
  return api.post("/admin/banner/add", data);
};

export const getBannerListApi = () => {
  return api.get("/admin/banner/list");
};

export const deleteBannerApi = (id) => {
  return api.delete(`/admin/banner/delete/${id}`);
};

export const updateBannerApi = (id, data) => {
  return api.put(`/admin/banner/update/${id}`, data);
};

///////////// Dashboard ////////////////////

export const getUserDashboardApi = (userId) => {
  return api.get(`/admin/usersDashboard?userId=${userId}`);
};

///////////// WITHDRAWAL /////////////////

export const manageWithdrawApi = (data) => {
  return api.post("/admin/manageWithdraw", data);
};

export const getWithdrawOrdersApi = (page = 1, limit = 10, status = "", search = "") => {
  return api.get(
    `/admin/withdrawOrders?page=${page}&limit=${limit}` +
    `${status ? `&status=${status}` : ""}` +
    `${search ? `&search=${search}` : ""}`
  );
};

// //////////INCOME /////////////////////

export const getAllIncomeApi = (page = 1, limit = 10, userId = "") => {
  return api.get(`/admin/getAllIncome?page=${page}&limit=${limit}&userId=${userId}`);
};

export const addIncomeApi = (data) => {
  return api.post("/admin/addIncome", data);
};


/////////////// TEAM LEVEL ///////////////////

export const getUserLevelViewApi = (userId) => {
  return api.get(`/admin/levelViewAdmin`, {
    params: { userId }
  });
};

export const getReferralByLevelApi = (userId, level, page = 1, limit = 10) => {
  return api.get(`/admin/myReferralAdmin`, {
    params: { userId, level, page, limit },
  });
};


////////// BIND //////////////

export const getBindUsersApi = (page = 1, limit = 10, type = "") => {
  return api.get(
    `/admin/getApiUsers?page=${page}&limit=${limit}${type ? `&type=${type}` : ""
    }`
  );
};

export const getUserBalanceApi = (userId) => {
  return api.get(
    `/admin/balance?userId=${userId}`
  );
};



//////////BINANCE////////////////

export const placeTradeApi = (data) => {
  return api.post("/admin/placetrade", data);
};

export const getTradeHistoryApi = (page = 1, limit = 10, userId, status) => {
  let url = `admin/getTradeHistory?page=${page}&limit=${limit}`;

  if (userId && userId.trim() !== "") {
    url += `&userId=${userId.trim()}`;
  }

  if (status && status !== "") {
    url += `&status=${status}`;
  }

  return api.get(url);
};

export const closeTradeApi = (tradeId) => {
  return api.post(`/admin/closetrade?tradeId=${tradeId}`)
};

export const getAllBinanceOrdersapi = (page = 1, limit = 10,userId) => {
  return api.get(
    `/admin/getAllBinanceOrders?page=${page}&limit=${limit}&userId=${userId}`
  );
};




// ApiService/Adminapi.js

export const getMyProfitHistoryApi = (page = 1,limit = 10,search = "",type = "") => {
  return api.get(
    `/admin/getMyProfitHistory?page=${page}&limit=${limit}&search=${search}&type=${type}`
  );
};