
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <>
        <Navbar />
        <main className="not-found">
          <h2>No booking selected</h2>
          <button onClick={() => navigate("/")}>
            Explore hotels
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="details-page">
        <div className="price-card" style={{ maxWidth: 600, margin: "30px auto" }}>
          <p className="eyebrow">BOOKING SUMMARY</p>
          <h1>{state.hotelName}</h1>

          <div className="price-line">
            <span>Room</span>
            <strong>{state.room}</strong>
          </div>

          <div className="price-line">
            <span>Guests</span>
            <strong>{state.guests}</strong>
          </div>

          <div className="price-line">
            <span>Check-in</span>
            <strong>{state.checkIn}</strong>
          </div>

          <div className="price-line">
            <span>Check-out</span>
            <strong>{state.checkOut}</strong>
          </div>

          <div className="price-line">
            <span>Nights</span>
            <strong>{state.nights}</strong>
          </div>

          <h3>Selected extras</h3>
          {state.extras.length ? (
            <ul>
              {state.extras.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No additional extras selected.</p>
          )}

          <div className="price-total">
            <span>Estimated total</span>
            <strong>
              ₹{state.totalPrice.toLocaleString("en-IN")}
            </strong>
          </div>

          <p className="price-note">
            This is a demo booking summary. No reservation or
            payment has been made.
          </p>

          <button
            className="search-btn booking-btn"
            onClick={() => navigate("/")}
          >
            Back to hotels
          </button>
        </div>
      </main>
    </>
  );
}
