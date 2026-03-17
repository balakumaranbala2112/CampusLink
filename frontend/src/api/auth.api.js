import api from "@/api/axios";

export const sendOTP = async (phone) => {
  const response = await api.post("/auth/send-otp", { phone });
  return response.data;
};

export const verifyOTP = async (phone, otp) => {
  const response = await api.post("/auth/verify-otp", { phone, otp });
  return response.data;
};

export const logoutAPI = async (userId) => {
  const response = await api.post("/auth/logout", userId);
  return response.data;
};
