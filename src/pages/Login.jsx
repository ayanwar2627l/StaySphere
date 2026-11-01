import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CalendarCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import api, { verifyUserLogin, saveRegisteredUserLocally, getRegisteredUsers } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Booking data passed from hotel details or package selection
  const returnTo = location.state?.returnTo;
  const bookingData = location.state?.bookingData;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  async function handleSubmit(e) {
    e?.preventDefault();
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

      // 1. Attempt login against real backend (stores account in MongoDB for future calls)
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
        name: existingLocal?.name,
      });

      login({ token: data.token, name: data.name, email: data.email });
      saveRegisteredUserLocally({ name: data.name, email: data.email });
      showToast(`Welcome back, ${data.name}!`, "success");

      // Redirect to booking checkout if client was booking, else home
      if (bookingData && returnTo) {
        navigate(returnTo, { state: bookingData, replace: true });
      } else {
        navigate(returnTo || "/", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response?.data?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // If backend is offline or disconnected, check local verified accounts
      try {
        const verifiedUser = verifyUserLogin(email, password);
        login(verifiedUser);
        showToast(`Welcome back, ${verifiedUser.name}! (Verified)`, "success");

        if (bookingData && returnTo) {
          navigate(returnTo, { state: bookingData, replace: true });
        } else {
          navigate(returnTo || "/", { replace: true });
        }
      } catch (verifyErr) {
        setError(verifyErr.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFillTest() {
    setEmail("test@staysphere.com");
    setPassword("test1234");
    setError("");
    showToast("Filled demo test credentials.", "info");
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
            onClick={() => navigate(-1)}
            
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* Pending Booking Notice */}
          {bookingData && (
            <div className="booking-pending-banner">
              <CalendarCheck size={18} className="banner-icon" />
              <div>
                <strong>Sign in to complete your booking</strong>
                <p>
                  Reserving at <strong>{bookingData.hotelName}</strong> ({bookingData.nights || 1}{" "}
                  {bookingData.nights === 1 ? "night" : "nights"}). Your selection is saved!
                </p>
              </div>
            </div>
          )}

          <div className="auth-card-header">
            <div className="auth-logo-center">
              <Logo variant="stacked" size="lg" />
            </div>
            <span className="auth-badge">
              <ShieldCheck size={14} /> StaySphere Member Portal
            </span>
            <h1>Welcome Back</h1>
            <p className="auth-sub">
              Sign in to your verified account to confirm reservations, apply exclusive discounts,
              and manage your luxury getaways.
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-page-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="e.g. aryan@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
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

            {/* Quick Demo Credentials helper */}
            <div className="demo-credentials-box">
              <div className="demo-cred-header">
                <Sparkles size={14} />
                <span>Test Credentials:</span>
                <button
                  type="button"
                  className="auto-fill-btn"
                  onClick={handleAutoFillTest}
                >
                  Auto-fill
                </button>
              </div>
              <div className="demo-cred-row">
                <span>Email:</span>
                <code>test@staysphere.com</code>
                <span>· Pass:</span>
                <code>test1234</code>
              </div>
            </div>

            <button
              type="submit"
              className="search-btn auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              Don't have a verified account yet?{" "}
              <Link
                to="/signup"
                state={{ returnTo, bookingData }}
                className="auth-link"
              >
                Create an Account
              </Link>
            </p>

            <div className="auth-trust-note">
              <ShieldCheck size={14} />
              <span>Protected by 256-bit SSL encryption & two-step verification</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
