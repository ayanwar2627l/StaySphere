import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, CheckCircle, Loader } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api";

// Validate basic UPI ID format: something@something
function isValidUPI(upi) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upi.trim());
}

export default function Payment() {
  const { state: bookingDetails } = useLocation();
  const navigate = useNavigate();

  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | success

  if (!bookingDetails) {
    return (
      <>
        <Navbar />
        <main className="not-found">
          <h2>No booking to pay for</h2>
          <button className="search-btn" onClick={() => navigate("/")}>
            Explore hotels
          </button>
        </main>
      </>
    );
  }

  async function handlePay() {
    setUpiError("");

    if (!upiId.trim()) {
      setUpiError("Please enter your UPI ID.");
      return;
    }

    if (!isValidUPI(upiId)) {
      setUpiError("Invalid UPI ID. Format should be: yourname@bank");
      return;
    }

    setStatus("processing");

    // Simulate payment processing delay (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const { data: booking } = await api.post("/bookings", {
        ...bookingDetails,
        paymentMethod: "UPI",
        upiId: upiId.trim(),
      });

      setStatus("success");

      // Brief success flash before navigating
      await new Promise((resolve) => setTimeout(resolve, 900));
      navigate("/booking", { state: booking });
    } catch {
      setStatus("idle");
      setUpiError("Payment failed. Please try again.");
    }
  }

  return (
    <>
      <Navbar />

      <main className="details-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="payment-wrapper">

          {/* Left — UPI form */}
          <div className="payment-card">
            <p className="eyebrow">SECURE PAYMENT</p>
            <h1 className="payment-title">Pay via UPI</h1>

            <div className="upi-logo-row">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png"
                alt="UPI"
                className="upi-logo"
              />
              <span>Accepted: GPay · PhonePe · Paytm · Any UPI app</span>
            </div>

            <label className="upi-label">
              <Smartphone size={16} />
              Your UPI ID
            </label>

            <div className={`upi-input-wrap ${upiError ? "has-error" : ""}`}>
              <input
                type="text"
                className="upi-input"
                placeholder="yourname@okhdfcbank"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setUpiError("");
                }}
                disabled={status !== "idle"}
              />
            </div>

            {upiError && <p className="upi-error">{upiError}</p>}

            <p className="upi-hint">
              Enter the UPI ID linked to your bank account or any UPI app.
            </p>

            <button
              className={`pay-btn ${status !== "idle" ? "pay-btn--busy" : ""}`}
              onClick={handlePay}
              disabled={status !== "idle"}
            >
              {status === "processing" && (
                <Loader size={18} className="spin" />
              )}
              {status === "success" && (
                <CheckCircle size={18} />
              )}
              {status === "idle" && `Pay ₹${bookingDetails.totalPrice.toLocaleString("en-IN")}`}
              {status === "processing" && "Processing payment…"}
              {status === "success" && "Payment successful!"}
            </button>

            <p className="price-note" style={{ textAlign: "center", marginTop: 14 }}>
              This is a demo payment. No real money is transferred.
            </p>
          </div>

          {/* Right — Order summary */}
          <div className="price-card payment-summary">
            <p className="eyebrow">ORDER SUMMARY</p>
            <h2>{bookingDetails.hotelName}</h2>

            <div className="price-line">
              <span>Room</span>
              <strong>{bookingDetails.room}</strong>
            </div>
            <div className="price-line">
              <span>Guests</span>
              <strong>{bookingDetails.guests}</strong>
            </div>
            <div className="price-line">
              <span>Check-in</span>
              <strong>{bookingDetails.checkIn}</strong>
            </div>
            <div className="price-line">
              <span>Check-out</span>
              <strong>{bookingDetails.checkOut}</strong>
            </div>
            <div className="price-line">
              <span>Nights</span>
              <strong>{bookingDetails.nights}</strong>
            </div>

            {bookingDetails.extras?.length > 0 && (
              <div className="price-line">
                <span>Extras</span>
                <strong>{bookingDetails.extras.join(", ")}</strong>
              </div>
            )}

            <div className="price-total">
              <span>Amount to pay</span>
              <strong>₹{bookingDetails.totalPrice.toLocaleString("en-IN")}</strong>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
