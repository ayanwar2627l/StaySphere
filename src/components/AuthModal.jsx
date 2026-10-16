import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import api from "../api";

export default function AuthModal({ onClose, onAuth }) {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        tab === "login" ? "/auth/login" : "/auth/register";

      const payload =
        tab === "login"
          ? { email, password }
          : { name, email, password };

      const { data } = await api.post(endpoint, payload);

      // Persist to localStorage
      localStorage.setItem("ss_token", data.token);
      localStorage.setItem("ss_user", JSON.stringify({ name: data.name, email: data.email }));

      onAuth({ name: data.name, email: data.email });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Sign in
          </button>
          <button
            className={tab === "register" ? "active" : ""}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Create account
          </button>
        </div>

        <h2 className="modal-title">
          {tab === "login" ? "Welcome back" : "Join StaySphere"}
        </h2>
        <p className="modal-subtitle">
          {tab === "login"
            ? "Sign in to manage your bookings."
            : "Create a free account to start booking."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>

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
              placeholder="Password"
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
              ? tab === "login" ? "Signing in…" : "Creating account…"
              : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="modal-switch">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}>
            {tab === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
}
