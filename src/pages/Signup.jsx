import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CalendarCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import api, { registerVerifiedUser, saveRegisteredUserLocally } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo;
  const bookingData = location.state?.bookingData;

  const [step, setStep] = useState("form"); // "form" | "verify-otp"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (bookingData && returnTo) {
      navigate(returnTo, { state: bookingData, replace: true });
    } else {
      navigate("/", { replace: true });
    }
    return null;
  }

  function handleInitiateSignup(e) {
    e?.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full legal name.");
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

    // Generate 6-digit OTP
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newOtp);
    setEnteredOtp("");
    setOtpError("");
    setStep("verify-otp");
    showToast(`Verification code sent to ${email.trim()}`, "info");
  }

  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setOtpError("");

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError("Invalid code. Please enter the exact 6-digit verification code.");
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

      if (bookingData && returnTo) {
        navigate(returnTo, { state: bookingData, replace: true });
      } else {
        navigate(returnTo || "/", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setOtpError("An account with this email is already registered. Please sign in.");
        setLoading(false);
        return;
      }

      // If backend is offline, register in verified local store
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

        if (bookingData && returnTo) {
          navigate(returnTo, { state: bookingData, replace: true });
        } else {
          navigate(returnTo || "/", { replace: true });
        }
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
    showToast("A new 6-digit verification code has been issued.", "info");
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="auth-page-wrapper">
        <div className="auth-page-card">
          {/* Back button */}
          <button
            type="button"
            className="back-btn auth-back-btn"
            onClick={() => {
              if (step === "verify-otp") {
                setStep("form");
                setOtpError("");
              } else {
                navigate(-1);
              }
            }}
          >
            <ArrowLeft size={16} />
            <span>{step === "verify-otp" ? "Back to Edit Info" : "Back"}</span>
          </button>

          {/* Pending Booking Notice */}
          {bookingData && (
            <div className="booking-pending-banner">
              <CalendarCheck size={18} className="banner-icon" />
              <div>
                <strong>Create an account to complete your booking</strong>
                <p>
                  Reserving at <strong>{bookingData.hotelName}</strong> ({bookingData.nights || 1}{" "}
                  {bookingData.nights === 1 ? "night" : "nights"}). Your room & dates are held!
                </p>
              </div>
            </div>
          )}

          {step === "form" ? (
            <>
              <div className="auth-card-header">
                <div className="auth-logo-center">
                  <Logo variant="stacked" size="lg" />
                </div>
                <span className="auth-badge">
                  <ShieldCheck size={14} /> Join StaySphere Luxury Club
                </span>
                <h1>Create Verified Account</h1>
                <p className="auth-sub">
                  Register for seamless reservations, instant check-in vouchers, and exclusive ₹1,500
                  welcome promotions.
                </p>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              <form onSubmit={handleInitiateSignup} className="auth-page-form">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="e.g. Aryan Sharma"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="e.g. aryan@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Create Password (min 6 characters)</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="search-btn auth-submit-btn">
                  <span>Continue to 2-Step Verification</span>
                  <ArrowRight size={17} />
                </button>
              </form>

              <div className="auth-card-footer">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ returnTo, bookingData }}
                    className="auth-link"
                  >
                    Sign in here
                  </Link>
                </p>

                <div className="auth-trust-note">
                  <ShieldCheck size={14} />
                  <span>2-step verification code will be issued on the next step</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* STEP 2: OTP VERIFICATION */}
              <div className="auth-card-header">
                <span className="auth-badge gold">
                  <KeyRound size={14} /> 2-Step Identity Verification
                </span>
                <h1>Verify Your Account</h1>
                <p className="auth-sub">
                  We issued a 6-digit confirmation code for <strong>{email}</strong>.
                </p>
              </div>

              {otpError && <div className="auth-error-banner">{otpError}</div>}

              {/* Secure OTP helper box */}
              <div className="otp-simulation-card">
                <div className="otp-sim-badge">
                  <ShieldCheck size={14} /> <span>StaySphere 2-Step Verification</span>
                </div>
                <p className="otp-sim-label">Your 6-Digit Verification Code:</p>
                <div className="otp-display-box">
                  <code>{generatedOtp}</code>
                  <button
                    type="button"
                    className="otp-fill-btn"
                    onClick={() => {
                      setEnteredOtp(generatedOtp);
                      setOtpError("");
                    }}
                  >
                    Fill Code
                  </button>
                </div>
                <span className="otp-sim-note">
                  In production, this code is delivered directly to your email inbox.
                </span>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-page-form">
                <div className="form-group">
                  <label htmlFor="otp-input">Enter 6-Digit Code</label>
                  <div className="input-with-icon">
                    <KeyRound size={18} className="field-icon" />
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      className="otp-styled-input"
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value.replace(/\D/g, ""));
                        setOtpError("");
                      }}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="search-btn auth-submit-btn"
                  disabled={loading || enteredOtp.length !== 6}
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="resend-row">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOtp}
                  >
                    <RefreshCw size={13} />
                    <span>Issue new code</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
