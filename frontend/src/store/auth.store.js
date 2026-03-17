import { create } from "zustand";

const useAuthStore = create((set) => ({
  /* || State */
  user: null,
  accessToken: null,
  isLoggedIn: false,

  /* || Actions (fn that update states) */

  login: (userData, token) => {
    set({
      user: userData,
      accessToken: token,
      isLoggedIn: true,
    });

    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", userData._id);
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      isLoggedIn: false,
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  },

  updateUser: (updateUser) => {
    set({
      user: updateUser,
    });
  },
}));

export default useAuthStore;
