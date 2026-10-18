import { useState, useEffect, useRef } from "react";
import { Hotel, UserRound, LogOut, ChevronDown } from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Read persisted user from localStorage
  const stored = localStorage.getItem("ss_user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

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

  function handleAuth(userData) {
    setUser(userData);
  }

  function handleSignOut() {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_user");
    setUser(null);
    setShowMenu(false);
  }

  // Initial/avatar letter
  const initial = user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <>
      <nav className="navbar">
        <a href="/" className="brand">
          <Hotel size={25} />
          <span>StaySphere</span>
        </a>

        <div className="nav-links">
          <a href="/#hotels">Hotels</a>
          <a href="/#experiences">Experiences</a>
          <a href="/#about">About</a>
        </div>

        {user ? (
          <div className="user-menu-wrap" ref={menuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setShowMenu((v) => !v)}
              aria-label="User menu"
            >
              <span className="user-avatar">{initial}</span>
              <span className="user-name">{user.name.split(" ")[0]}</span>
              <ChevronDown size={15} />
            </button>

            {showMenu && (
              <div className="user-dropdown">
                <p className="user-dropdown-email">{user.email}</p>
                <button className="user-dropdown-item" onClick={handleSignOut}>
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => setShowModal(true)}>
            <UserRound size={17} />
            Sign in
          </button>
        )}
      </nav>

      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onAuth={handleAuth}
        />
      )}
    </>
  );
}
