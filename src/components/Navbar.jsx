import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  UserRound,
  LogOut,
  ChevronDown,
  Heart,
  CalendarCheck,
  Compass,
  Menu,
  X,
  Sparkles,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import AuthModal from "./AuthModal";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { getLocalBookings } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);

  const menuRef = useRef(null);

  // Read bookings count from localStorage
  useEffect(() => {
    const list = getLocalBookings();
    setBookingsCount(list.length);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  function handleSignOut() {
    logout();
    setShowMenu(false);
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <>
      <header className="navbar-wrapper">
        <nav className="navbar">
          {/* Brand */}
          <Link to="/" className="brand-luxury-link" aria-label="StaySphere Luxury Stays">
            <Logo variant="navbar" size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              <Compass size={16} />
              <span>Explore Stays</span>
            </Link>

            <a href="/#experiences" className="nav-link">
              <Sparkles size={16} />
              <span>Experiences</span>
            </a>

            <Link
              to="/saved"
              className={`nav-link ${location.pathname === "/saved" ? "active" : ""}`}
            >
              <Heart size={16} />
              <span>Saved Stays</span>
              {wishlist.length > 0 && (
                <span className="nav-counter-pill">{wishlist.length}</span>
              )}
            </Link>

            <Link
              to="/my-bookings"
              className={`nav-link ${location.pathname === "/my-bookings" ? "active" : ""}`}
            >
              <Ticket size={16} />
              <span>My Bookings</span>
              {bookingsCount > 0 && (
                <span className="nav-counter-pill booking-pill">{bookingsCount}</span>
              )}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            {user ? (
              <div className="user-menu-wrap" ref={menuRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="User menu"
                >
                  <span className="user-avatar">{initial}</span>
                  <span className="user-name">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={showMenu ? "rotate-180" : ""} />
                </button>

                {showMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-name-row">
                        <p className="user-dropdown-name">{user.name}</p>
                        <span className="user-verified-pill">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      </div>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setShowMenu(false);
                        navigate("/my-bookings");
                      }}
                    >
                      <CalendarCheck size={15} />
                      <span>My Bookings</span>
                      {bookingsCount > 0 && (
                        <span className="dropdown-counter">{bookingsCount}</span>
                      )}
                    </button>

                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setShowMenu(false);
                        navigate("/saved");
                      }}
                    >
                      <Heart size={15} />
                      <span>Saved Stays</span>
                      {wishlist.length > 0 && (
                        <span className="dropdown-counter">{wishlist.length}</span>
                      )}
                    </button>
                    <div className="user-dropdown-divider"></div>

                    <button
                      className="user-dropdown-item logout-item"
                      onClick={handleSignOut}
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-nav-buttons">
                <Link to="/login" className="login-btn nav-signin-link">
                  <UserRound size={15} />
                  <span>Sign in</span>
                </Link>
                <Link to="/signup" className="nav-signup-pill">
                  <span>Create Account</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Compass size={18} />
                <span>Explore Stays</span>
              </Link>

              <a href="/#experiences" onClick={() => setMobileMenuOpen(false)}>
                <Sparkles size={18} />
                <span>Experiences</span>
              </a>

              <Link to="/saved" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={18} />
                <span>Saved Stays</span>
                {wishlist.length > 0 && (
                  <span className="nav-counter-pill">{wishlist.length}</span>
                )}
              </Link>

              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>
                <Ticket size={18} />
                <span>My Bookings</span>
                {bookingsCount > 0 && (
                  <span className="nav-counter-pill booking-pill">{bookingsCount}</span>
                )}
              </Link>

              {!user && (
                <div className="mobile-auth-group">
                  <Link
                    to="/login"
                    className="mobile-login-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserRound size={16} />
                    <span>Sign in</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="mobile-signup-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
