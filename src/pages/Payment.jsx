import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Lock,
  CalendarDays,
  Users,
  BedDouble,
  Sparkles,
  Check,
  Clock,
  Tag,
  UserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import { submitBooking } from "../api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function isValidUPI(upi) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upi.trim());
}

export default function Payment() {
  const { state: bookingDetails } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Active payment method: "upi" | "card" | "hotel"
  const [method, setMethod] = useState("upi");

  // UPI inputs
  const [upiId, setUpiId] = useState("");
  const [upiMode, setUpiMode] = useState("id"); // "id" | "qr"

  // Card inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(user?.name || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState(bookingDetails?.couponCode || "");
  const [discount, setDiscount] = useState(bookingDetails?.discount || 0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const baseSubtotal = bookingDetails
    ? (bookingDetails.roomPrice || 0) * bookingDetails.nights +
      (bookingDetails.extrasTotal || 0) +
      (bookingDetails.taxesAndFees || 0)
    : 0;

  const totalDue = Math.max(0, baseSubtotal - discount);

  function handleApplyCoupon(e) {
    e?.preventDefault();
    setCouponError("");
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (cleaned === "STAY1500") {
      setCouponCode("STAY1500");
      setDiscount(1500);
      setCouponInput("");
      showToast("Coupon STAY1500 applied! You saved ₹1,500.", "success");
    } else {
      setCouponError("Invalid coupon code. Try STAY1500 for ₹1,500 off.");
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    setDiscount(0);
    setCouponError("");
    showToast("Coupon removed.", "info");
  }

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!bookingDetails) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="not-found">
          <h2>No reservation in progress</h2>
          <p>Please select a hotel and customize your stay before payment.</p>
          <button className="search-btn" onClick={() => navigate("/")}>
            Explore Luxury Stays
          </button>
        </main>
      </div>
    );
  }

  // Card input formatters
  function handleCardNumberChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  }

  function handleExpiryChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  }

  function handleGoToLogin() {
    showToast("Please sign in or create an account to confirm your reservation.", "info");
    navigate("/login", {
      state: {
        returnTo: "/payment",
        bookingData: {
          ...bookingDetails,
          discount,
          couponCode,
          totalPrice: totalDue,
        },
      },
    });
  }

  async function handlePaymentSubmit(e) {
    e?.preventDefault();
    setErrorMsg("");

    // Enforce strict authenticated verified user check
    if (!user) {
      handleGoToLogin();
      return;
    }

    // Validation per method
    if (method === "upi") {
      if (upiMode === "id") {
        if (!upiId.trim()) {
          setErrorMsg("Please enter your UPI ID.");
          return;
        }
        if (!isValidUPI(upiId)) {
          setErrorMsg("Invalid UPI format. Example: yourname@bank or 9876543210@paytm");
          return;
        }
      }
    } else if (method === "card") {
      const cleanNum = cardNumber.replace(/\s/g, "");
      if (cleanNum.length < 15) {
        setErrorMsg("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMsg("Please enter valid card expiry (MM/YY).");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg("Please enter valid 3-digit CVV.");
        return;
      }
    }

    setStatus("processing");

    // Simulate payment gateway handshake delay (1.4s)
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const payload = {
        ...bookingDetails,
        userEmail: user.email,
        userName: user.name,
        paymentMethod:
          method === "upi" ? "UPI" : method === "card" ? "Credit/Debit Card" : "Pay at Hotel",
        upiId: method === "upi" ? upiId.trim() || "qr-scanned@upi" : "",
        cardLast4: method === "card" ? cardNumber.slice(-4) : "",
        couponCode: couponCode || "",
        discount: discount || 0,
        totalPrice: totalDue,
      };

      const booking = await submitBooking(payload);

      setStatus("success");
      showToast("Payment successful! Your stay is confirmed.", "success");

      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/booking", { state: booking });
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setErrorMsg("Payment failed. Please try again or choose another payment method.");
    }
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="details-page payment-page">
        {/* Top bar with price lock timer */}
        <div className="payment-top-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back to customize</span>
          </button>

          <div className="price-lock-timer">
            <Clock size={16} className="timer-icon" />
            <span>
              Price held for:{" "}
              <strong>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </strong>
            </span>
          </div>
        </div>

        <div className="payment-layout-grid">
          {/* Left Column: Payment Form */}
          <section className="payment-card-main">
            <p className="eyebrow">CHECKOUT & CONFIRMATION</p>
            <h1 className="payment-headline">Select Payment Method</h1>

            {/* Verified Traveler vs Sign-in Required Banner */}
            {user ? (
              <div className="traveler-verified-strip">
                <ShieldCheck size={18} className="verified-shield" />
                <div className="traveler-info-col">
                  <span className="traveler-tag">Booking for verified guest:</span>
                  <div className="traveler-name-wrap">
                    <strong className="traveler-name">{user.name}</strong>
                    <span className="traveler-email">({user.email})</span>
                  </div>
                </div>
                <span className="account-verified-tag">✓ Account Verified</span>
              </div>
            ) : (
              <div className="auth-required-box">
                <div className="auth-required-left">
                  <div className="auth-lock-bubble">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4>Sign-in Required to Book</h4>
                    <p>
                      StaySphere requires a verified user account to confirm reservations and issue vouchers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="auth-prompt-btn"
                  onClick={handleGoToLogin}
                >
                  <UserRound size={15} />
                  <span>Sign in / Create Account</span>
                </button>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="payment-method-tabs">
              <button
                type="button"
                className={`method-tab-btn ${method === "upi" ? "active" : ""}`}
                onClick={() => { setMethod("upi"); setErrorMsg(""); }}
              >
                <Smartphone size={18} />
                <span>UPI Instant</span>
              </button>

              <button
                type="button"
                className={`method-tab-btn ${method === "card" ? "active" : ""}`}
                onClick={() => { setMethod("card"); setErrorMsg(""); }}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                className={`method-tab-btn ${method === "hotel" ? "active" : ""}`}
                onClick={() => { setMethod("hotel"); setErrorMsg(""); }}
              >
                <Building size={18} />
                <span>Pay at Hotel</span>
              </button>
            </div>

            {/* METHOD 1: UPI */}
            {method === "upi" && (
              <div className="payment-tab-content">
                <div className="upi-mode-switch">
                  <button
                    className={`upi-sub-tab ${upiMode === "id" ? "active" : ""}`}
                    onClick={() => setUpiMode("id")}
                  >
                    Pay with UPI ID
                  </button>
                  <button
                    className={`upi-sub-tab ${upiMode === "qr" ? "active" : ""}`}
                    onClick={() => setUpiMode("qr")}
                  >
                    Scan QR Code
                  </button>
                </div>

                {upiMode === "id" ? (
                  <div className="upi-id-form">
                    <label className="upi-field-label">
                      <span>Enter Virtual Payment Address (UPI ID)</span>
                      <div className="input-with-icon">
                        <Smartphone size={18} className="field-icon" />
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="quick-fill-btn"
                          onClick={() => setUpiId("traveler@okhdfcbank")}
                        >
                          Use Demo ID
                        </button>
                      </div>
                    </label>

                    <p className="upi-instructions">
                      A payment request will be sent to your UPI app (Google Pay, PhonePe, Paytm, or BHIM).
                    </p>
                  </div>
                ) : (
                  <div className="upi-qr-box">
                    <div className="qr-container">
                      {/* Dynamic QR SVG */}
                      <svg viewBox="0 0 100 100" width="160" height="160" className="qr-svg">
                        <rect width="100" height="100" fill="#ffffff" rx="8" />
                        {/* Finder patterns */}
                        <rect x="10" y="10" width="25" height="25" fill="#143e32" />
                        <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                        <rect x="18" y="18" width="9" height="9" fill="#143e32" />

                        <rect x="65" y="10" width="25" height="25" fill="#143e32" />
                        <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                        <rect x="73" y="18" width="9" height="9" fill="#143e32" />

                        <rect x="10" y="65" width="25" height="25" fill="#143e32" />
                        <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                        <rect x="18" y="73" width="9" height="9" fill="#143e32" />

                        {/* Random dummy data blocks */}
                        <rect x="42" y="15" width="6" height="6" fill="#143e32" />
                        <rect x="52" y="25" width="6" height="6" fill="#143e32" />
                        <rect x="42" y="42" width="16" height="16" fill="#143e32" />
                        <rect x="65" y="45" width="8" height="8" fill="#143e32" />
                        <rect x="45" y="70" width="8" height="8" fill="#143e32" />
                        <rect x="75" y="75" width="12" height="12" fill="#143e32" />
                        <rect x="25" y="45" width="8" height="8" fill="#143e32" />
                      </svg>
                      <span className="qr-caption">Scan with any UPI App</span>
                    </div>
                    <p className="qr-subtext">
                      Open Google Pay, PhonePe, Paytm, or BHIM and scan this code to complete payment
                      of <strong>₹{totalDue.toLocaleString("en-IN")}</strong>.
                    </p>
                  </div>
                )}

                <div className="upi-partners-badge">
                  <span>Accepted on StaySphere:</span>
                  <div className="upi-apps-row">
                    <span className="app-tag">Google Pay</span>
                    <span className="app-tag">PhonePe</span>
                    <span className="app-tag">Paytm</span>
                    <span className="app-tag">BHIM UPI</span>
                    <span className="app-tag">CRED</span>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: CREDIT / DEBIT CARD */}
            {method === "card" && (
              <div className="payment-tab-content">
                <form className="card-form" onSubmit={(e) => e.preventDefault()}>
                  <label className="card-field-label">
                    <span>Card Number</span>
                    <div className="input-with-icon">
                      <CreditCard size={18} className="field-icon" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 ···· ···· 8901"
                        maxLength="19"
                        autoFocus
                      />
                    </div>
                  </label>

                  <label className="card-field-label">
                    <span>Cardholder Name</span>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                    />
                  </label>

                  <div className="card-dual-fields">
                    <label className="card-field-label">
                      <span>Expiry (MM/YY)</span>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        maxLength="5"
                      />
                    </label>

                    <label className="card-field-label">
                      <span>CVV / CVC</span>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        maxLength="4"
                      />
                    </label>
                  </div>

                  <div className="card-brands-row">
                    <span className="brand-chip">Visa</span>
                    <span className="brand-chip">Mastercard</span>
                    <span className="brand-chip">RuPay</span>
                    <span className="brand-chip">American Express</span>
                  </div>
                </form>
              </div>
            )}

            {/* METHOD 3: PAY AT HOTEL */}
            {method === "hotel" && (
              <div className="payment-tab-content hotel-pay-box">
                <div className="hotel-pay-icon-row">
                  <Building size={32} className="hotel-pay-icon" />
                  <div>
                    <h3>Pay upon Arrival</h3>
                    <p>
                      No prepayment needed now. Your room is 100% held and guaranteed. You can pay
                      via Cash, Card, or UPI directly at the hotel front desk during check-in.
                    </p>
                  </div>
                </div>

                <div className="hotel-pay-perks">
                  <p><Check size={16} /> Free cancellation up to 48 hours before check-in</p>
                  <p><Check size={16} /> Instant booking voucher sent to your email</p>
                  <p><Check size={16} /> Guaranteed room reservation</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && <p className="payment-error-banner">{errorMsg}</p>}

            {/* Action Button */}
            <button
              type="button"
              className={`search-btn checkout-pay-btn ${status === "processing" ? "busy" : ""} ${!user ? "auth-cta" : ""}`}
              onClick={user ? handlePaymentSubmit : handleGoToLogin}
              disabled={status === "processing"}
            >
              {!user ? (
                <>
                  <UserRound size={17} />
                  <span>Sign in with Verified Account to Confirm</span>
                </>
              ) : status === "processing" ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Authorizing Secure Reservation...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle size={18} />
                  <span>Reservation Confirmed!</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>
                    {method === "hotel"
                      ? "Confirm & Hold Reservation"
                      : `Pay ₹${totalDue.toLocaleString("en-IN")} & Confirm`}
                  </span>
                </>
              )}
            </button>

            <div className="security-notice-strip">
              <ShieldCheck size={18} className="shield-icon" />
              <span>
                Encrypted with 256-bit bank security. Your booking is protected by StaySphere's
                verified stay guarantee.
              </span>
            </div>
          </section>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="payment-sidebar">
            <div className="order-summary-card">
              <p className="eyebrow">YOUR ITINERARY</p>
              <h2 className="summary-title">Reservation Summary</h2>

              {/* Hotel mini preview */}
              <div className="summary-hotel-row">
                {bookingDetails.hotelImage && (
                  <img
                    src={bookingDetails.hotelImage}
                    alt={bookingDetails.hotelName}
                    className="summary-thumb"
                  />
                )}
                <div>
                  <h3 className="summary-hotel-name">{bookingDetails.hotelName}</h3>
                  <p className="summary-hotel-loc">{bookingDetails.location}</p>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Stay specs */}
              <div className="summary-specs-list">
                <div className="summary-spec-item">
                  <BedDouble size={16} />
                  <span className="spec-label">Room Type</span>
                  <strong>{bookingDetails.room}</strong>
                </div>

                <div className="summary-spec-item">
                  <CalendarDays size={16} />
                  <span className="spec-label">Dates</span>
                  <strong>
                    {new Date(bookingDetails.checkIn).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {new Date(bookingDetails.checkOut).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                </div>

                <div className="summary-spec-item">
                  <Users size={16} />
                  <span className="spec-label">Guests & Stay</span>
                  <strong>
                    {bookingDetails.guests} {bookingDetails.guests === 1 ? "Guest" : "Guests"} ·{" "}
                    {bookingDetails.nights} {bookingDetails.nights === 1 ? "Night" : "Nights"}
                  </strong>
                </div>
              </div>

              {/* Extras list if any */}
              {bookingDetails.extras?.length > 0 && (
                <>
                  <div className="summary-divider"></div>
                  <div className="summary-extras-box">
                    <span className="extras-title">Included Experiences:</span>
                    {bookingDetails.extras.map((extra) => (
                      <div key={extra} className="extra-item-pill">
                        <Sparkles size={12} />
                        <span>{extra}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="summary-divider"></div>

              {/* Price Calculation */}
              <div className="summary-pricing-rows">
                <div className="summary-price-row">
                  <span>Room Charge</span>
                  <span>
                    ₹{((bookingDetails.roomPrice || 0) * bookingDetails.nights).toLocaleString("en-IN")}
                  </span>
                </div>

                {bookingDetails.extrasTotal > 0 && (
                  <div className="summary-price-row">
                    <span>Experiences & Extras</span>
                    <span>₹{bookingDetails.extrasTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="summary-price-row">
                  <span>Taxes & StaySphere Service Fee</span>
                  <span>₹{(bookingDetails.taxesAndFees || 0).toLocaleString("en-IN")}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-price-row discount-row">
                    <span>Coupon Discount ({couponCode})</span>
                    <span className="discount-amount">- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-total-row">
                  <span>Total Due</span>
                  <strong>₹{totalDue.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* Promo Code section in Payment */}
              <div className="card-coupon-section payment-coupon-box">
                <div className="coupon-header-row">
                  <Tag size={14} />
                  <span>Promo Code / Coupon</span>
                </div>

                {discount > 0 ? (
                  <div className="applied-coupon-pill">
                    <div className="applied-coupon-text">
                      <Sparkles size={14} className="sparkle-gold" />
                      <span>
                        <strong>{couponCode}</strong> applied (-₹{discount.toLocaleString("en-IN")})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Enter STAY1500"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCoupon(e);
                      }}
                    />
                    <button
                      type="button"
                      className="apply-coupon-btn"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponError && <p className="coupon-error-text">{couponError}</p>}

                {discount === 0 && (
                  <button
                    type="button"
                    className="quick-coupon-suggestion"
                    onClick={() => {
                      setCouponCode("STAY1500");
                      setDiscount(1500);
                      showToast("Coupon STAY1500 applied: ₹1,500 discount!", "success");
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Have code <strong>STAY1500</strong>? Click to apply ₹1,500 OFF</span>
                  </button>
                )}
              </div>

              <div className="summary-cancel-badge">
                <ShieldCheck size={16} />
                <span>Free cancellation up to 48 hours prior to arrival</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Auth Modal Guard */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
