import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  BedDouble,
  Ticket,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Compass,
  Sparkles,
  Lock,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import api, { getLocalBookings, cancelBooking } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MyBookings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "confirmed" | "cancelled"
  const [cancellingId, setCancellingId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // 1. Initial fast load from local cache
    const local = getLocalBookings();
    setBookings(local);

    // 2. If user is signed in, load persistent bookings directly from backend
    if (user?.email) {
      api
        .get(`/bookings?email=${encodeURIComponent(user.email.trim())}`)
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            // Merge remote bookings with local bookings (deduplicating by _id)
            const map = new Map();
            res.data.forEach((b) => map.set(String(b._id), b));
            local.forEach((b) => {
              if (!map.has(String(b._id))) {
                map.set(String(b._id), b);
              }
            });
            const merged = Array.from(map.values());
            setBookings(merged);
            localStorage.setItem("ss_bookings", JSON.stringify(merged));
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote bookings:", err.message);
        });
    }
  }, [user]);

  async function handleCancel(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this reservation? Full refund will be issued per policy.")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const updated = await cancelBooking(bookingId);
      setBookings(updated);
      showToast("Reservation successfully cancelled.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to cancel reservation.", "error");
    } finally {
      setCancellingId(null);
    }
  }

  function viewVoucher(booking) {
    navigate("/booking", { state: booking });
  }

  // If user is not authenticated, require sign-in to view bookings
  if (!user) {
    return (
      <div className="page-container">
        <Navbar />

        <main className="details-page my-bookings-page">
          <div className="empty-bookings-box auth-locked-bookings">
            <Lock size={44} className="empty-icon text-gold" />
            <h2>Sign in to view your bookings</h2>
            <p>
              Your reservations are secured. Please sign in with your verified StaySphere account to
              access your booking vouchers, check-in QR codes, and reservation management.
            </p>
            <button
              className="search-btn auth-cta"
              onClick={() => navigate("/login", { state: { returnTo: "/my-bookings" } })}
              style={{ margin: "16px auto 0" }}
            >
              <UserRound size={17} />
              <span>Sign in / Create Account</span>
            </button>
          </div>
        </main>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // Filter bookings belonging to this verified user
  const userBookings = bookings.filter(
    (b) => !b.userEmail || b.userEmail.toLowerCase() === user.email.toLowerCase()
  );

  const filteredBookings = userBookings.filter((b) => {
    if (filter === "confirmed") return b.status === "Confirmed";
    if (filter === "cancelled") return b.status === "Cancelled";
    return true;
  });

  const formattedDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="page-container">
      <Navbar />

      <main className="details-page my-bookings-page">
        {/* Page Title */}
        <div className="bookings-header-row">
          <div>
            <p className="eyebrow">YOUR RESERVATIONS</p>
            <h1>My Stays & Bookings</h1>
            <p className="sub-instruction">
              Manage your upcoming stays, view official check-in vouchers, and track booking history.
            </p>
          </div>

          <Link to="/" className="search-btn explore-more-btn">
            <Compass size={17} />
            <span>Find New Stays</span>
          </Link>
        </div>

        {/* User Status Bar */}
        <div className="traveler-verified-strip" style={{ marginBottom: "20px" }}>
          <ShieldCheck size={18} className="verified-shield" />
          <div className="traveler-info-col">
            <span className="traveler-tag">Verified Member:</span>
            <div className="traveler-name-wrap">
              <strong className="traveler-name">{user.name}</strong>
              <span className="traveler-email">({user.email})</span>
            </div>
          </div>
          <span className="account-verified-tag">✓ Verified Member</span>
        </div>

        {/* Filter Tabs */}
        <div className="bookings-tabs-bar">
          <button
            className={`tab-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Bookings ({userBookings.length})
          </button>
          <button
            className={`tab-filter-btn ${filter === "confirmed" ? "active" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({userBookings.filter((b) => b.status === "Confirmed").length})
          </button>
          <button
            className={`tab-filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({userBookings.filter((b) => b.status === "Cancelled").length})
          </button>
        </div>

        {/* Bookings List or Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="empty-bookings-box">
            <Ticket size={48} className="empty-icon" />
            <h3>No reservations found</h3>
            <p>
              {filter === "all"
                ? "You haven't made any hotel reservations yet. Browse our handpicked luxury properties across India to plan your next getaway."
                : `You don't have any ${filter} reservations.`}
            </p>
            <Link to="/" className="search-btn">
              Explore Luxury Stays
            </Link>
          </div>
        ) : (
          <div className="bookings-cards-list">
            {filteredBookings.map((b) => {
              const isCancelled = b.status === "Cancelled";

              return (
                <div
                  key={b._id}
                  className={`booking-ticket-card ${isCancelled ? "cancelled-card" : ""}`}
                >
                  <div className="ticket-card-header">
                    <div>
                      <span className="booking-id-tag">ID: {b._id}</span>
                      <h2 className="ticket-hotel-name">{b.hotelName}</h2>
                      {b.location && (
                        <p className="ticket-loc">
                          <MapPin size={14} /> {b.location}
                        </p>
                      )}
                    </div>

                    <div className="ticket-badge-box">
                      {isCancelled ? (
                        <span className="status-badge-cancelled">
                          <AlertCircle size={14} /> Cancelled
                        </span>
                      ) : (
                        <span className="status-badge-confirmed">
                          <CheckCircle2 size={14} /> Confirmed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ticket-details-grid">
                    <div className="ticket-detail-item">
                      <CalendarDays size={16} />
                      <div>
                        <span className="label">Dates</span>
                        <strong>
                          {formattedDate(b.checkIn)} – {formattedDate(b.checkOut)}
                        </strong>
                        <span className="sub">
                          ({b.nights} {b.nights === 1 ? "night" : "nights"})
                        </span>
                      </div>
                    </div>

                    <div className="ticket-detail-item">
                      <BedDouble size={16} />
                      <div>
                        <span className="label">Room</span>
                        <strong>{b.room}</strong>
                        <span className="sub">
                          {b.guests} {b.guests === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-detail-item">
                      <Sparkles size={16} />
                      <div>
                        <span className="label">Total Amount</span>
                        <strong>₹{b.totalPrice?.toLocaleString("en-IN")}</strong>
                        <span className="sub">Via {b.paymentMethod || "UPI"}</span>
                      </div>
                    </div>
                  </div>

                  {b.extras?.length > 0 && (
                    <div className="ticket-extras-row">
                      <span className="extras-label">Extras:</span>
                      {b.extras.map((extra) => (
                        <span key={extra} className="ticket-extra-tag">
                          {extra}
                        </span>
                      ))}
                    </div>
                  )}

                  {b.discount > 0 && (
                    <div className="ticket-extras-row" style={{ marginTop: "8px" }}>
                      <span className="extras-label">Promo:</span>
                      <span className="ticket-extra-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                        {b.couponCode || "STAY1500"} (-₹{b.discount.toLocaleString("en-IN")})
                      </span>
                    </div>
                  )}

                  <div className="ticket-actions-row">
                    <button className="ticket-action-btn primary" onClick={() => viewVoucher(b)}>
                      <Printer size={15} />
                      <span>View Voucher</span>
                    </button>

                    {!isCancelled && (
                      <button
                        className="ticket-action-btn danger"
                        onClick={() => handleCancel(b._id)}
                        disabled={cancellingId === b._id}
                      >
                        <XCircle size={15} />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
