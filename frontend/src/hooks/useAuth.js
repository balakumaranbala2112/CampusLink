import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth.store";

const useAuth = () => {
  const { isLoggedIn, login, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (token && userId && !isLoggedIn) {
      login({ _id: userId }, token);
    }
  }, []);

  return { isLoggedIn };
};

export default useAuth;
