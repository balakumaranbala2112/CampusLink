import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "@/store/auth.store";
import LoginPage from "@/pages/auth/LoginPage";
import HomePage from "@/pages/home/HomePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,

      staleTime: 5 * 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* catch all unknown routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
