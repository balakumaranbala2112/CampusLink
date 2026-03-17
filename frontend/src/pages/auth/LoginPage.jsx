import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { sendOTP, verifyOTP } from "@/api/auth.api";
import useAuthStore from "@/store/auth.store";

const LoginPage = () => {
  // navigation hook — used to redirect after login
  const navigate = useNavigate();

  // get login function from auth store
  const { login } = useAuthStore();

  // ── State ──────────────────────────────────
  const [phone, setPhone] = useState("");
  // stores the phone number user types

  const [otp, setOtp] = useState("");
  // stores the OTP user types

  const [step, setStep] = useState("phone");
  // 'phone' = show phone input
  // 'otp'   = show OTP input
  // controls which step of login we are on

  const [loading, setLoading] = useState(false);
  // true = request in progress → show spinner

  const [error, setError] = useState("");
  // stores error message to show user

  // ── Handle Send OTP ────────────────────────
  const handleSendOTP = async () => {
    // clear previous error
    setError("");

    // validate phone number
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
      // return stops the function here → don't proceed
    }

    try {
      setLoading(true);
      // show loading spinner

      await sendOTP(phone);
      // call backend → POST /auth/send-otp
      // OTP appears in your terminal

      setStep("otp");
      // switch to OTP step
      // now show OTP input instead of phone input
    } catch (error) {
      // error.response.data.error = error message from backend
      // || fallback message if backend message not available
      setError(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
      // always hide spinner whether success or fail
    }
  };

  // ── Handle Verify OTP ──────────────────────
  const handleVerifyOTP = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyOTP(phone, otp);
      // call backend → POST /auth/verify-otp
      // result.data = { accessToken, refreshToken, user }

      // save to auth store + localStorage
      login(result.data.user, result.data.accessToken);

      // redirect to home page
      navigate("/home");
    } catch (error) {
      setError(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">🔗 campusLink</h1>
          <p className="text-campus-muted text-sm mt-2">
            Professional networking for college students
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 — Phone Input */}
        {step === "phone" && (
          <div className="space-y-4">
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                // only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPhone(value);
              }}
            />
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSendOTP}
              loading={loading}
            >
              Send OTP
            </Button>
          </div>
        )}

        {/* STEP 2 — OTP Input */}
        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-campus-muted text-center">
              OTP sent to {phone}.
              <span className="text-campus-mid font-medium">
                {" "}
                Check your terminal.
              </span>
            </p>

            <Input
              label="Enter OTP"
              type="tel"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setOtp(value);
              }}
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleVerifyOTP}
              loading={loading}
            >
              Verify OTP
            </Button>

            {/* Go back to change phone number */}
            <button
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="w-full text-sm text-campus-muted hover:text-primary-600 transition-colors"
            >
              Change phone number
            </button>
          </div>
        )}

        <p className="text-center text-xs text-campus-muted mt-6">
          By continuing you agree to campusLink Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
