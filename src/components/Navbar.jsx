
import { Hotel, UserRound } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="brand">
        <Hotel size={25} />
        <span>StaySphere</span>
      </a>

      <div className="nav-links">
        <a href="#hotels">Hotels</a>
        <a href="#experiences">Experiences</a>
        <a href="#about">About</a>
      </div>

      <button className="login-btn">
        <UserRound size={17} />
        Sign in
      </button>
    </nav>
  );
}
