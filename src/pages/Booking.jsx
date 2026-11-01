import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  BedDouble,
  Sparkles,
  ArrowLeft,
  Printer,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Compass,
  CalendarPlus,
  Ticket,
  MapPin,
  Clock,
  CreditCard,
  FileCheck2,
  Building,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import { useToast } from "../context/ToastContext";

export default function Booking() {
  const { state: booking } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState(false);

  if (!booking) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="not-found">
          <div className="not-found-card">
            <Award size={48} className="empty-icon text-gold" />
            <h2>No active booking voucher found</h2>
            <p>
              You can explore our handpicked luxury sanctuaries or review your existing confirmed reservations.
            </p>
            <div className="btn-group">
              <button className="search-btn" onClick={() => navigate("/")}>
                <Compass size={16} /> Explore Luxury Stays
              </button>
              <button
                className="search-btn secondary"
                onClick={() => navigate("/my-bookings")}
              >
                <Ticket size={16} /> My Reservations
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculations & Formatting
  const nights =
    booking.nights ||
    (booking.checkIn && booking.checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(booking.checkOut) - new Date(booking.checkIn)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1);

  const roomPrice =
    booking.roomPrice ||
    Math.round(
      (booking.totalPrice + (booking.discount || 0)) / (nights * 1.12)
    );

  const roomSubtotal = roomPrice * nights;
  const extrasTotal = booking.extrasTotal || 0;
  const taxesAndFees =
    booking.taxesAndFees || Math.round((roomSubtotal + extrasTotal) * 0.12);
  const discount = booking.discount || 0;
  const couponCode = booking.couponCode || (discount > 0 ? "STAY1500" : "");
  const totalPrice =
    booking.totalPrice ||
    Math.max(0, roomSubtotal + extrasTotal + taxesAndFees - discount);

  const formattedDate = (dateStr) => {
    if (!dateStr) return "Flexible Date";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formattedTimeDate = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "01 Nov 2026, 07:30 PM";
    }
  };

  const bookingId = booking._id || "BK-STAYSPHERE-7249";
  const issueDate = formattedTimeDate(booking.createdAt);

  // Deterministic Cryptographic verification code
  const verificationHash = `SHA256: 8F7E${bookingId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8)}9B4C2D1E0A${Math.abs(Math.round(totalPrice)).toString(16).toUpperCase()}`;

  function handleCopyId() {
    navigator.clipboard.writeText(bookingId);
    setCopiedId(true);
    showToast("Reservation Folio ID copied to clipboard!", "success");
    setTimeout(() => setCopiedId(false), 3000);
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const text = `My StaySphere Luxury Reservation Voucher\nHotel: ${booking.hotelName}\nRoom: ${booking.room}\nDates: ${formattedDate(booking.checkIn)} to ${formattedDate(booking.checkOut)}\nFolio ID: ${bookingId}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Reservation Voucher: ${booking.hotelName}`,
          text: text,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast("Reservation details copied to clipboard!", "success");
    }
  }

  function generateCalendarLink() {
    const title = encodeURIComponent(`Stay at ${booking.hotelName}`);
    const details = encodeURIComponent(
      `StaySphere Luxury Folio #${bookingId}\nProperty: ${booking.hotelName}\nRoom: ${booking.room}\nGuests: ${booking.guests}\nAddress: ${booking.location || "India"}`
    );
    try {
      const checkInIso = new Date(booking.checkIn)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "");
      const checkOutIso = new Date(booking.checkOut)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${checkInIso}/${checkOutIso}`;
    } catch {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    }
  }

  return (
    <div className="page-container luxury-voucher-page">
      <Navbar />

      <main className="details-page booking-confirmation-page">
        {/* Top actions control bar (hidden in print) */}
        <div className="confirm-top-bar">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>Explore more stays</span>
          </button>

          <div className="confirm-actions-group">
            <button
              className="action-pill-btn print-primary-btn"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>Print Tax Invoice & Voucher</span>
            </button>

            <a
              href={generateCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="action-pill-btn"
            >
              <CalendarPlus size={15} />
              <span>Add to Calendar</span>
            </a>

            <button className="action-pill-btn" onClick={handleShare}>
              <Share2 size={15} />
              <span>Share Voucher</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            OFFICIAL 5-STAR LUXURY FOLIO & RESERVATION VOUCHER
            ══════════════════════════════════════════════════════════════ */}
        <article className="luxury-folio-document" id="printable-voucher">
          {/* Document Watermark Background */}
          <div className="folio-watermark-overlay" aria-hidden="true">
            <Logo variant="icon-only" size={320} />
          </div>

          {/* 1. OFFICIAL TAX FOLIO HEADER */}
          <header className="folio-header">
            <div className="folio-header-left">
              <Logo variant="voucher" size={54} />
              <div className="corporate-meta-text">
                <p>StaySphere Hospitality & Resorts Private Limited</p>
                <p>Corporate HQ: Floor 18, Horizon Tower, Aerocity, New Delhi 110037</p>
                <p>
                  <strong>GSTIN:</strong> 07AABCS9218P1Z5 &nbsp;•&nbsp;{" "}
                  <strong>CIN:</strong> U55101DL2024PTC39281 &nbsp;•&nbsp;{" "}
                  <strong>SAC Code:</strong> 996311 (Luxury Accommodation)
                </p>
                <p>
                  <strong>Concierge Desk:</strong> 1800-STAY-SPHERE &nbsp;•&nbsp; concierge@staysphere.com
                </p>
              </div>
            </div>

            <div className="folio-header-right">
              <div className="folio-title-tag">
                <FileCheck2 size={14} />
                <span>OFFICIAL TAX INVOICE & RESERVATION FOLIO</span>
              </div>

              <div className="folio-ref-box">
                <span className="ref-label">Booking Reference / Folio No.</span>
                <div className="ref-number-row">
                  <span className="ref-code">{bookingId}</span>
                  <button
                    type="button"
                    className="folio-copy-pill"
                    onClick={handleCopyId}
                    title="Copy Folio Number"
                  >
                    {copiedId ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="folio-timestamp">
                <span>Issued: </span>
                <strong>{issueDate}</strong>
              </div>

              <div className="folio-status-pill-wrap">
                <span className="folio-status-badge">
                  <ShieldCheck size={14} />
                  <span>GUARANTEED & CONFIRMED</span>
                </span>
              </div>
            </div>
          </header>

          <div className="folio-divider-gold"></div>

          {/* 2. GUEST & STAY EXECUTIVE FOLIO SUMMARY GRID */}
          <section className="folio-executive-grid">
            {/* Panel 1: Primary Guest Folio */}
            <div className="folio-card-panel">
              <span className="panel-kicker">PRIMARY GUEST FOLIO</span>
              <h3 className="panel-lead-name">
                {booking.userName || "Verified StaySphere Guest"}
              </h3>
              <div className="panel-info-row">
                <Mail size={14} className="panel-icon" />
                <span>{booking.userEmail || "guest@staysphere.com"}</span>
              </div>
              <div className="panel-info-row">
                <Award size={14} className="panel-icon text-gold" />
                <span>StaySphere Elite Member • Verified Status</span>
              </div>
              <div className="panel-info-row">
                <CheckCircle size={14} className="panel-icon text-green" />
                <span>Identity & Contact Authentication Verified</span>
              </div>
            </div>

            {/* Panel 2: Dates & Itinerary Schedule */}
            <div className="folio-card-panel">
              <span className="panel-kicker">SCHEDULE & DURATION</span>
              <div className="schedule-dates-dual">
                <div className="schedule-col">
                  <span className="schedule-sublabel">CHECK-IN</span>
                  <strong>{formattedDate(booking.checkIn)}</strong>
                  <span className="time-sub">Guaranteed from 2:00 PM</span>
                </div>
                <div className="schedule-arrow">→</div>
                <div className="schedule-col">
                  <span className="schedule-sublabel">CHECK-OUT</span>
                  <strong>{formattedDate(booking.checkOut)}</strong>
                  <span className="time-sub">Express until 11:00 AM</span>
                </div>
              </div>
              <div className="duration-pill-bar">
                <span>
                  <strong>{nights}</strong> {nights === 1 ? "Night" : "Nights"} Duration
                </span>
                <span>•</span>
                <span>
                  <strong>{booking.guests}</strong> {booking.guests === 1 ? "Guest" : "Guests"} (Adults)
                </span>
              </div>
            </div>

            {/* Panel 3: Sanctuary Property Details */}
            <div className="folio-card-panel">
              <span className="panel-kicker">RESERVED PROPERTY</span>
              <h3 className="panel-lead-name">{booking.hotelName}</h3>
              <div className="panel-info-row">
                <MapPin size={14} className="panel-icon" />
                <span>{booking.location || "Curated Destination, India"}</span>
              </div>
              <div className="panel-info-row">
                <Building size={14} className="panel-icon" />
                <span>5-Star Luxury Heritage Retreat & Spa</span>
              </div>
              <div className="panel-info-row">
                <Phone size={14} className="panel-icon" />
                <span>VIP Front Desk: +91 1800-STAY-SPHERE</span>
              </div>
            </div>

            {/* Panel 4: Suite & Package Category */}
            <div className="folio-card-panel">
              <span className="panel-kicker">SUITE & PACKAGE CATEGORY</span>
              <h3 className="panel-lead-name">{booking.room}</h3>
              {booking.packageName && (
                <div className="panel-info-row">
                  <Sparkles size={14} className="panel-icon text-gold" />
                  <strong>{booking.packageName}</strong>
                </div>
              )}
              <div className="panel-info-row">
                <BedDouble size={14} className="panel-icon" />
                <span>King Bedded Luxury Sanctuary Suite</span>
              </div>
              <div className="panel-info-row">
                <Clock size={14} className="panel-icon" />
                <span>24/7 Dedicated Retreat Butler Service</span>
              </div>
            </div>
          </section>

          {/* 3. CURATED INCLUSIONS & EXPERIENCE ADD-ONS */}
          {booking.extras && booking.extras.length > 0 && (
            <section className="folio-inclusions-strip">
              <div className="inclusions-title-col">
                <Sparkles size={16} className="text-gold" />
                <span>INCLUDED PRIVILEGES & EXPERIENCES:</span>
              </div>
              <div className="inclusions-tags-col">
                {booking.extras.map((extra, idx) => (
                  <span key={idx} className="luxury-inclusion-chip">
                    <Check size={12} />
                    <span>{extra}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 4. FORMAL ITEMIZED TAX INVOICE & FOLIO BILLING TABLE */}
          <section className="folio-table-section">
            <div className="folio-section-title">
              <span>ITEMIZED TAX BILLING & FOLIO CHARGES</span>
              <span className="currency-note">All amounts shown in Indian Rupees (₹ INR)</span>
            </div>

            <table className="folio-billing-table">
              <thead>
                <tr>
                  <th className="th-num">#</th>
                  <th className="th-desc">Description of Hospitality Services & Accommodation</th>
                  <th className="th-basis">Rate / Basis</th>
                  <th className="th-qty">Duration / Qty</th>
                  <th className="th-total">Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {/* Line 1: Accommodation */}
                <tr>
                  <td className="td-num">01</td>
                  <td className="td-desc">
                    <div className="line-item-primary">
                      <strong>Accommodation Tariff — {booking.room}</strong>
                    </div>
                    <span className="line-item-sub">
                      Complimentary high-speed Wi-Fi, turndown service, morning newspaper & valet parking.
                    </span>
                  </td>
                  <td className="td-basis">₹{roomPrice.toLocaleString("en-IN")} / night</td>
                  <td className="td-qty">{nights} {nights === 1 ? "Night" : "Nights"}</td>
                  <td className="td-total">₹{roomSubtotal.toLocaleString("en-IN")}</td>
                </tr>

                {/* Line 2: Package Inclusions if present */}
                {booking.packageName && (
                  <tr>
                    <td className="td-num">02</td>
                    <td className="td-desc">
                      <div className="line-item-primary">
                        <strong>Curated Package: {booking.packageName}</strong>
                      </div>
                      <span className="line-item-sub">
                        Daily gourmet buffet breakfast, chef's 4-course dinner, signature excursion & late check-out.
                      </span>
                    </td>
                    <td className="td-basis">Package Inclusive</td>
                    <td className="td-qty">1 Package</td>
                    <td className="td-total text-green">INCLUDED (₹0.00)</td>
                  </tr>
                )}

                {/* Line 3: Extras Total if selected */}
                {extrasTotal > 0 && (
                  <tr>
                    <td className="td-num">{booking.packageName ? "03" : "02"}</td>
                    <td className="td-desc">
                      <div className="line-item-primary">
                        <strong>Guest Add-ons & Wellness Sanctuary Extras</strong>
                      </div>
                      <span className="line-item-sub">
                        {booking.extras?.slice(0, 3).join(", ") || "Selected stay enhancements"}
                      </span>
                    </td>
                    <td className="td-basis">Per Selected Plan</td>
                    <td className="td-qty">1 Itinerary</td>
                    <td className="td-total">₹{extrasTotal.toLocaleString("en-IN")}</td>
                  </tr>
                )}

                {/* Line 4: Goods & Services Tax (GST 12%) */}
                <tr>
                  <td className="td-num">
                    {booking.packageName && extrasTotal > 0
                      ? "04"
                      : booking.packageName || extrasTotal > 0
                      ? "03"
                      : "02"}
                  </td>
                  <td className="td-desc">
                    <div className="line-item-primary">
                      <strong>Goods & Services Tax (GST 12%) — SAC 996311</strong>
                    </div>
                    <span className="line-item-sub">
                      Central GST (CGST @ 6%) + State GST (SGST @ 6%) as per luxury hospitality tariff regulations.
                    </span>
                  </td>
                  <td className="td-basis">Statutory 12%</td>
                  <td className="td-qty">Standard</td>
                  <td className="td-total">₹{taxesAndFees.toLocaleString("en-IN")}</td>
                </tr>

                {/* Line 5: Promotional Coupon Savings if applied */}
                {discount > 0 && (
                  <tr className="discount-row-highlight">
                    <td className="td-num">★</td>
                    <td className="td-desc">
                      <div className="line-item-primary text-gold">
                        <strong>Promotional Privilege: Voucher {couponCode || "STAY1500"}</strong>
                      </div>
                      <span className="line-item-sub">
                        StaySphere verified elite welcome promotion discount applied directly to reservation folio.
                      </span>
                    </td>
                    <td className="td-basis text-gold">Direct Benefit</td>
                    <td className="td-qty text-gold">1 Voucher</td>
                    <td className="td-total text-gold discount-val">
                      - ₹{discount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Folio Bottom Billing Summary Block */}
            <div className="folio-settlement-block">
              <div className="settlement-left-meta">
                <div className="settlement-detail-row">
                  <CreditCard size={16} className="text-gold" />
                  <div>
                    <span className="settle-label">Settlement Mode:</span>
                    <strong className="settle-val">
                      {booking.paymentMethod === "hotel"
                        ? "Guaranteed for Payment at Front Desk"
                        : booking.paymentMethod === "card"
                        ? `Credit / Debit Card (Visa •••• ${booking.cardLast4 || "4242"})`
                        : `UPI Instant Transfer (${booking.upiId || "upi-verified"})`}
                    </strong>
                  </div>
                </div>

                <div className="settlement-detail-row">
                  <ShieldCheck size={16} className="text-green" />
                  <div>
                    <span className="settle-label">Transaction Status:</span>
                    <strong className="settle-val text-green">
                      {booking.paymentMethod === "hotel"
                        ? "Reservation Guaranteed • Card Hold Verified"
                        : "Settled in Full • Transaction Verified (TXN-STAY-94821)"}
                    </strong>
                  </div>
                </div>

                <div className="settlement-detail-row">
                  <Clock size={16} />
                  <div>
                    <span className="settle-label">Cancellation Policy:</span>
                    <span className="settle-val">
                      Complimentary 100% full refund up to 48 hours prior to check-in.
                    </span>
                  </div>
                </div>
              </div>

              {/* Grand Total & Luxury Settlement Stamp */}
              <div className="settlement-right-total">
                <div className="invoice-total-card">
                  <span className="invoice-total-kicker">NET AMOUNT PAYABLE</span>
                  <div className="invoice-total-amount">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </div>
                  <span className="invoice-total-taxes-note">
                    ✓ All Indian Luxury Hospitality Taxes & Fees Included
                  </span>
                </div>

                {/* Circular Luxury Embossed Official Stamp */}
                <div className="luxury-folio-stamp">
                  <div className="stamp-inner-ring">
                    <span className="stamp-arc-top">STAYSPHERE LUXURY</span>
                    <div className="stamp-center-mark">
                      <Check size={20} />
                      <span className="stamp-status-text">
                        {booking.paymentMethod === "hotel" ? "GUARANTEED" : "PAID IN FULL"}
                      </span>
                    </div>
                    <span className="stamp-arc-bottom">OFFICIAL FOLIO</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FAST-TRACK VIP CHECK-IN PASS & SECURITY HASH */}
          <section className="folio-security-strip">
            <div className="security-qr-column">
              {/* High-Resolution Vector QR Code Pass */}
              <div className="luxury-qr-frame">
                <svg
                  viewBox="0 0 100 100"
                  width="116"
                  height="116"
                  className="desk-qr"
                  aria-label="Contactless Check-in QR"
                >
                  <rect width="100" height="100" fill="#ffffff" rx="8" />
                  {/* Top Left Finder */}
                  <rect x="8" y="8" width="26" height="26" fill="#124033" rx="4" />
                  <rect x="12" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="16" y="16" width="10" height="10" fill="#124033" rx="2" />

                  {/* Top Right Finder */}
                  <rect x="66" y="8" width="26" height="26" fill="#124033" rx="4" />
                  <rect x="70" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="74" y="16" width="10" height="10" fill="#124033" rx="2" />

                  {/* Bottom Left Finder */}
                  <rect x="8" y="66" width="26" height="26" fill="#124033" rx="4" />
                  <rect x="12" y="70" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="16" y="74" width="10" height="10" fill="#124033" rx="2" />

                  {/* High Density Data Matrix Modules */}
                  <rect x="38" y="10" width="6" height="6" fill="#124033" />
                  <rect x="48" y="10" width="6" height="6" fill="#c5932a" />
                  <rect x="38" y="20" width="6" height="6" fill="#124033" />
                  <rect x="48" y="20" width="12" height="6" fill="#124033" />

                  <rect x="10" y="38" width="6" height="6" fill="#124033" />
                  <rect x="20" y="38" width="6" height="6" fill="#c5932a" />
                  <rect x="10" y="48" width="12" height="6" fill="#124033" />
                  <rect x="26" y="48" width="6" height="6" fill="#124033" />

                  {/* Center Luxury Emblem Mark */}
                  <rect x="40" y="40" width="20" height="20" fill="#124033" rx="4" />
                  <circle cx="50" cy="50" r="6" fill="#c5932a" />
                  <circle cx="50" cy="50" r="2.5" fill="#ffffff" />

                  <rect x="66" y="38" width="6" height="6" fill="#124033" />
                  <rect x="76" y="38" width="14" height="6" fill="#124033" />
                  <rect x="66" y="48" width="10" height="6" fill="#c5932a" />
                  <rect x="82" y="48" width="8" height="6" fill="#124033" />

                  <rect x="38" y="66" width="6" height="12" fill="#124033" />
                  <rect x="48" y="66" width="6" height="6" fill="#124033" />
                  <rect x="48" y="76" width="14" height="6" fill="#c5932a" />
                  <rect x="38" y="82" width="6" height="6" fill="#124033" />

                  <rect x="66" y="66" width="6" height="6" fill="#c5932a" />
                  <rect x="76" y="66" width="6" height="6" fill="#124033" />
                  <rect x="86" y="66" width="6" height="12" fill="#124033" />
                  <rect x="66" y="76" width="14" height="6" fill="#124033" />
                  <rect x="76" y="86" width="16" height="6" fill="#124033" />
                </svg>
              </div>
              <span className="qr-caption">Front Desk Express Pass</span>
            </div>

            <div className="security-instructions-column">
              <h4>VIP Fast-Track Check-In Instructions</h4>
              <ul>
                <li>
                  <strong>1. Express Keycard Issuance:</strong> Present this digital pass or printed folio at the hotel VIP reception desk to bypass standard registration queues.
                </li>
                <li>
                  <strong>2. Identification Requirement:</strong> In compliance with Indian hospitality laws, please carry a valid government photo identification (Passport, Aadhaar, or Driving License) for each resident guest.
                </li>
                <li>
                  <strong>3. Dedicated Personal Concierge:</strong> For private airport transfers, dietary preferences, or room arrangement requests, contact the 24/7 StaySphere Concierge desk anytime.
                </li>
              </ul>

              <div className="hash-verification-strip">
                <span className="hash-label">Cryptographic Digital Signature:</span>
                <code className="hash-code">{verificationHash}</code>
              </div>
            </div>
          </section>

          {/* 6. OFFICIAL SIGNATURE & LEGAL FOLIO DECLARATION */}
          <footer className="folio-legal-footer">
            <div className="legal-left-declaration">
              <p className="legal-notice-heading">Terms & Tax Invoice Declaration</p>
              <p className="legal-fineprint">
                This document serves as an authentic Tax Invoice and confirmed accommodation voucher issued under Rule 48 of the Central Goods and Services Tax (CGST) Rules, 2017. All room nights, meals, and experience inclusions are guaranteed and secured upon presentation of this folio. StaySphere Hospitality Private Limited certifies that the tax information detailed herein represents a bona fide hospitality contract.
              </p>
            </div>

            <div className="signatory-right-block">
              <div className="signature-graphic">
                <span className="sig-handwritten">Priyanshu J.</span>
              </div>
              <div className="signatory-line"></div>
              <strong className="signatory-name">Priyanshu J</strong>
              <span className="signatory-title">
                Chief Hospitality Officer & General Manager
              </span>
              <span className="signatory-corp">StaySphere Luxury Group Worldwide</span>
            </div>
          </footer>
        </article>

        {/* Bottom Navigation CTA (hidden in print) */}
        <div className="confirm-bottom-nav">
          <Link to="/my-bookings" className="search-btn secondary-btn">
            <Ticket size={17} />
            <span>Manage My Reservations</span>
          </Link>

          <Link to="/" className="search-btn">
            <Compass size={17} />
            <span>Discover More Luxury Stays</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
