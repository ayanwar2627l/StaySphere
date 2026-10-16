import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, CalendarDays, Users, BedDouble, Sparkles, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Booking() {
  const { state: booking } = useLocation();
  const navigate = useNavigate();

  if (!booking) {
    return (
      <>
        <Navbar />
        <main className="not-found">
          <h2>No booking found</h2>
          <button className="search-btn" onClick={() => navigate("/")}>
            Explore hotels
          </button>
        </main>
      </>
    );
  }

  const formattedDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <Navbar />

      <main className="details-page">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back to hotels
        </button>

        <div className="confirm-wrapper">

          {/* Success badge */}
          <div className="confirm-badge">
            <CheckCircle size={48} strokeWidth={1.5} />
            <div>
              <h1>Booking Confirmed!</h1>
              <p>Your reservation has been saved successfully.</p>
            </div>
          </div>

          {/* Booking ID */}
          <div className="confirm-id">
            <span>Booking ID</span>
            <code>{booking._id}</code>
          </div>

          {/* Details grid */}
          <div className="confirm-grid">

            <div className="confirm-section">
              <p className="eyebrow">STAY DETAILS</p>

              <div className="confirm-row">
                <BedDouble size={16} />
                <span className="confirm-label">Hotel</span>
                <strong>{booking.hotelName}</strong>
              </div>

              <div className="confirm-row">
                <BedDouble size={16} />
                <span className="confirm-label">Room type</span>
                <strong>{booking.room}</strong>
              </div>

              <div className="confirm-row">
                <Users size={16} />
                <span className="confirm-label">Guests</span>
                <strong>{booking.guests} {booking.guests === 1 ? "guest" : "guests"}</strong>
              </div>
            </div>

            <div className="confirm-section">
              <p className="eyebrow">DATES</p>

              <div className="confirm-row">
                <CalendarDays size={16} />
                <span className="confirm-label">Check-in</span>
                <strong>{formattedDate(booking.checkIn)}</strong>
              </div>

              <div className="confirm-row">
                <CalendarDays size={16} />
                <span className="confirm-label">Check-out</span>
                <strong>{formattedDate(booking.checkOut)}</strong>
              </div>

              <div className="confirm-row">
                <MapPin size={16} />
                <span className="confirm-label">Duration</span>
                <strong>{booking.nights} {booking.nights === 1 ? "night" : "nights"}</strong>
              </div>
            </div>

          </div>

          {/* Extras */}
          {booking.extras?.length > 0 && (
            <div className="confirm-section">
              <p className="eyebrow">EXTRAS INCLUDED</p>
              <div className="confirm-extras">
                {booking.extras.map((item) => (
                  <span key={item} className="confirm-extra-tag">
                    <Sparkles size={12} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="confirm-total">
            <span>Total paid</span>
            <strong>₹{booking.totalPrice.toLocaleString("en-IN")}</strong>
          </div>

          <p className="price-note" style={{ textAlign: "center", marginTop: 10 }}>
            A confirmation has been saved to our system. You'll hear from the hotel before check-in.
          </p>

          <button
            className="search-btn booking-btn"
            onClick={() => navigate("/")}
          >
            Explore more hotels
          </button>

        </div>
      </main>
    </>
  );
}
