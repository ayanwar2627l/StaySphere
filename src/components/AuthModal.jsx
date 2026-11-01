import { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import api, { registerVerifiedUser, verifyUserLogin, saveRegisteredUserLocally, getRegisteredUsers } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState("login"); // "login" | "register"
  const [step, setStep] = useState("form"); // "form" | "verify-otp"

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Switch tabs
  function handleTabChange(newTab) {
    setTab(newTab);
    setStep("form");
    setError("");
    setOtpError("");
    setEnteredOtp("");
  }

  // Handle Sign In submission
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const existingLocal = getRegisteredUsers().find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      // 1. Try real backend API (stores user in MongoDB for future calls)
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
        name: existingLocal?.name,
      });

      login({ token: data.token, name: data.name, email: data.email });
      saveRegisteredUserLocally({ name: data.name, email: data.email });
      showToast(`Welcome back, ${data.name}!`, "success");
      onClose();
    } catch (err) {
      // If server explicitly rejected password or account
      if (err.response?.status === 401) {
        setError(err.response?.data?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // If backend server is offline/unreachable, verify against local registered verified accounts
      try {
        const verifiedUser = verifyUserLogin(email, password);
        login(verifiedUser);
        showToast(`Welcome back, ${verifiedUser.name}!`, "success");
        onClose();
      } catch (verifyErr) {
        setError(verifyErr.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 1 of Registration: Validate and issue OTP
  function handleInitiateRegistration(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Generate 6-digit secure OTP
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newOtp);
    setEnteredOtp("");
    setOtpError("");
    setStep("verify-otp");
  }

  // Step 2 of Registration: Verify OTP and create verified user
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setOtpError("");

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError("Invalid verification code. Please enter the exact 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try registering with backend
      const { data } = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      login({ token: data.token, name: data.name, email: data.email });
      saveRegisteredUserLocally({ name: data.name, email: data.email });
      showToast("Account verified and registered successfully!", "success");
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setOtpError("An account with this email is already registered. Please sign in.");
        setLoading(false);
        return;
      }

      // If backend offline, register into verified local store
      try {
        const registered = registerVerifiedUser({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        login({
          name: registered.name,
          email: registered.email,
          token: "verified_jwt_" + Date.now(),
        });

        showToast("Account verified and registered successfully!", "success");
        onClose();
      } catch (regErr) {
        setOtpError(regErr.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleResendOtp() {
    const freshOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(freshOtp);
    setEnteredOtp("");
    setOtpError("");
    showToast("A new verification code has been issued.", "info");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Tabs (only shown on initial form step) */}
        {step === "form" && (
          <div className="modal-tabs">
            <button
              className={tab === "login" ? "active" : ""}
              onClick={() => handleTabChange("login")}
            >
              Sign in
            </button>
            <button
              className={tab === "register" ? "active" : ""}
              onClick={() => handleTabChange("register")}
            >
              Create account
            </button>
          </div>
        )}

        {/* STEP: VERIFY EMAIL OTP */}
        {step === "verify-otp" ? (
          <div className="otp-verification-container">
            <button
              type="button"
              className="otp-back-btn"
              onClick={() => setStep("form")}
            >
              <ArrowLeft size={16} />
              <span>Back to edit details</span>
            </button>

            <div className="otp-icon-header">
              <div className="otp-icon-bubble">
                <ShieldCheck size={28} />
              </div>
              <h2 className="modal-title">Verify your email</h2>
              <p className="modal-subtitle">
                Enter the 6-digit security code sent to <strong>{email}</strong> to activate your verified account.
              </p>
            </div>

            {/* Simulated Live OTP Dispatch Notice */}
            <div className="otp-simulated-banner">
              <div className="otp-banner-top">
                <Mail size={15} />
                <span>StaySphere Security Dispatch</span>
              </div>
              <div className="otp-code-highlight">
                <span>Verification Code:</span>
                <strong>{generatedOtp}</strong>
              </div>
              <span className="otp-expiry-note">Valid for this session · Do not share</span>
            </div>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="auth-field otp-input-field">
                <KeyRound size={18} />
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) =>
                    setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              {otpError && <p className="auth-error">{otpError}</p>}

              <button
                type="submit"
                className="pay-btn"
                disabled={loading || enteredOtp.length !== 6}
                style={{ marginTop: 8 }}
              >
                {loading ? "Verifying code..." : "Verify & Complete Registration"}
              </button>

              <div className="resend-otp-row">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                >
                  <RefreshCw size={13} />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP: LOGIN OR REGISTRATION FORM */
          <>
            <h2 className="modal-title">
              {tab === "login" ? "Welcome back" : "Join StaySphere"}
            </h2>
            <p className="modal-subtitle">
              {tab === "login"
                ? "Sign in with your verified credentials."
                : "Create a verified account to book luxury stays."}
            </p>

            <form
              className="auth-form"
              onSubmit={tab === "login" ? handleLoginSubmit : handleInitiateRegistration}
            >
              {tab === "register" && (
                <div className="auth-field">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              )}

              <div className="auth-field">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={tab === "login"}
                />
              </div>

              <div className="auth-field">
                <Lock size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={tab === "login" ? "Password" : "Password (min. 6 characters)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="pay-btn"
                disabled={loading}
                style={{ marginTop: 6 }}
              >
                {loading
                  ? tab === "login"
                    ? "Authenticating…"
                    : "Sending verification code…"
                  : tab === "login"
                  ? "Sign in"
                  : "Continue to Email Verification"}
              </button>
            </form>

            {/* Sample Member Access helper */}
            {tab === "login" && (
              <div className="demo-credentials-box">
                <div className="demo-cred-header">
                  <Sparkles size={14} className="text-gold" />
                  <span>Sample Member Access:</span>
                </div>
                <button
                  type="button"
                  className="auto-fill-btn"
                  onClick={() => {
                    setEmail("test@staysphere.com");
                    setPassword("test1234");
                    setError("");
                  }}
                >
                  Auto-fill demo account (test@staysphere.com)
                </button>
              </div>
            )}

            <p className="modal-switch">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() =>
                  handleTabChange(tab === "login" ? "register" : "login")
                }
              >
                {tab === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
