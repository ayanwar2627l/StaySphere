import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Check,
  Heart,
  Share2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
  Clock,
  HelpCircle,
  BedDouble,
  Utensils,
  Waves,
  Tag,
  Lock,
  UserRound,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import { getHotelById, getHotels } from "../api";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const DEFAULT_EXTRAS = [
  { name: "Breakfast Buffet", price: 650, desc: "Gourmet multi-cuisine daily breakfast for all guests" },
  { name: "Exclusive Wildlife / City Safari", price: 3800, desc: "Private chauffeured tour with senior naturalist/guide" },
  { name: "Luxury Airport Chauffeur", price: 1600, desc: "Private luxury sedan pickup & drop from airport" },
  { name: "Holistic Couple Spa Session", price: 3200, desc: "60-minute relaxing aromatherapy massage & steam" },
];

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [similarHotels, setSimilarHotels] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Reservation state
  const [room, setRoom] = useState("");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Coupon / Promo code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const active = sessionStorage.getItem("ss_active_coupon");
      if (active && active.toUpperCase() === "STAY1500") {
        return { code: "STAY1500", discount: 1500 };
      }
    } catch {
      // Ignore
    }
    return null;
  });
  const [couponError, setCouponError] = useState("");

  // Photo modal state
  const [activePhotoModal, setActivePhotoModal] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    getHotelById(id)
      .then((data) => {
        setHotel(data);
        if (data.roomTypes?.length) {
          setRoom(data.roomTypes[0].name);
        } else {
          setRoom("Standard Room");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load hotel details.");
      })
      .finally(() => setLoading(false));

    // Also get similar stays
    getHotels().then((all) => {
      setSimilarHotels(all.filter((h) => String(h._id || h.id) !== String(id)).slice(0, 3));
    });
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="details-page">
          <div className="details-skeleton">
            <div className="skeleton-line" style={{ width: "30%", height: "24px" }}></div>
            <div className="skeleton-gallery" style={{ height: "380px", margin: "20px 0" }}></div>
            <div className="skeleton-line" style={{ width: "60%", height: "36px" }}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="not-found">
          <h2>{error || "Hotel not found"}</h2>
          <p>The hotel you are looking for may have been updated or moved.</p>
          <button className="search-btn" onClick={() => navigate("/")}>
            Back to Explore Stays
          </button>
        </main>
      </div>
    );
  }

  const favorite = isFavorite(hotel._id || hotel.id);

  function handleHeartClick() {
    const added = toggleFavorite(hotel._id || hotel.id);
    if (added) {
      showToast(`Saved "${hotel.name}" to your wishlist`, "success");
    } else {
      showToast(`Removed from your wishlist`, "info");
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name} on StaySphere!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    }
  }

  // Room pricing calculation
  const roomTypes = hotel.roomTypes || [
    { name: "Standard Room", extra: 0, sqft: "420 sq.ft", bed: "1 King Bed", guests: 2, desc: "Classic room with deluxe amenities." },
    { name: "Deluxe Suite", extra: 1500, sqft: "650 sq.ft", bed: "1 Super King Bed", guests: 3, desc: "Panoramic view with private lounge." },
    { name: "Presidential Villa", extra: 3500, sqft: "950 sq.ft", bed: "1 King + 1 Twin", guests: 4, desc: "Private pool and dedicated butler." },
  ];

  const selectedRoomObj = roomTypes.find((r) => r.name === room) || roomTypes[0];

  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
      : 1;

  const roomTotal = (hotel.price + (selectedRoomObj.extra || 0)) * nights;

  const availableExtras = DEFAULT_EXTRAS;
  const extrasTotal = availableExtras.reduce((sum, item) => {
    return selectedExtras.includes(item.name) ? sum + item.price : sum;
  }, 0);

  const taxesAndFees = Math.round((roomTotal + extrasTotal) * 0.12);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPrice = Math.max(0, roomTotal + extrasTotal + taxesAndFees - discount);

  function toggleExtra(name) {
    setSelectedExtras((current) =>
      current.includes(name) ? current.filter((x) => x !== name) : [...current, name]
    );
  }

  function handleApplyCoupon(e) {
    e?.preventDefault();
    setCouponError("");
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (cleaned === "STAY1500") {
      setAppliedCoupon({ code: "STAY1500", discount: 1500 });
      setCouponInput("");
      showToast("Coupon STAY1500 applied: ₹1,500 discount!", "success");
    } else {
      setCouponError("Invalid coupon code. Try code STAY1500 for ₹1,500 off.");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
    try {
      sessionStorage.removeItem("ss_active_coupon");
    } catch {
      // Ignore
    }
    showToast("Coupon removed.", "info");
  }

  function handleProceedToPayment() {
    if (!checkIn || !checkOut) {
      showToast("Please select your check-in and check-out dates.", "error");
      document.getElementById("stay-dates")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      showToast("Check-out date must be after check-in date.", "error");
      return;
    }

    const bookingPayload = {
      hotelId: hotel._id || hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      location: hotel.location,
      room: selectedRoomObj.name,
      roomPrice: hotel.price + (selectedRoomObj.extra || 0),
      guests,
      checkIn,
      checkOut,
      nights,
      extras: selectedExtras,
      extrasTotal,
      taxesAndFees,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      totalPrice,
    };

    // Strict sign-in requirement to book: redirect to dedicated login page
    if (!user) {
      showToast("Please sign in or create an account to complete your reservation.", "info");
      navigate("/login", {
        state: {
          returnTo: "/payment",
          bookingData: bookingPayload,
        },
      });
      return;
    }

    navigate("/payment", { state: bookingPayload });
  }

  // Curated All-Inclusive Stay & Experience Packages
  const curatedPackages = [
    {
      id: "signature-retreat",
      title: "Signature All-Inclusive Package",
      badge: "Most Popular",
      roomName: "Deluxe Suite",
      extraPerNight: 2200,
      tagline: "The complete luxury experience with chef-curated dining & signature excursion",
      inclusions: [
        "Daily Gourmet Buffet Breakfast & Chef's 4-Course Dinner",
        "Welcome Champagne on arrival & Exotic Fruit Basket",
        hotel.packages?.[0] || "Signature Wildlife Safari or Guided Nature Walk",
        "Complimentary High-speed Wi-Fi & Valet Parking",
        "Late Check-out until 2:00 PM (subject to availability)",
      ],
    },
    {
      id: "wellness-escape",
      title: "Holistic Wellness & Spa Sanctuary",
      badge: "Wellness Choice",
      roomName: "Luxury Villa",
      extraPerNight: 3400,
      tagline: "Rejuvenate mind and body with customized therapies and organic nutrition",
      inclusions: [
        "60-minute Couple's Ayurvedic Body Rejuvenation Therapy",
        "Daily Sunrise Yoga & Guided Mindfulness Meditation",
        "Organic Farm-to-Table Breakfast & Detox Herbal Elixirs",
        hotel.packages?.[1] || "Evening Stargazing Session with Telescope",
        "24/7 Dedicated Retreat Butler & Valet Service",
      ],
    },
  ];

  function handleBookPackage(pkg) {
    if (!checkIn || !checkOut) {
      showToast("Please select your stay dates before booking a package.", "info");
      document.getElementById("stay-dates")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      showToast("Check-out date must be after check-in date.", "error");
      return;
    }

    const pkgRoomPrice = hotel.price + pkg.extraPerNight;
    const pkgSubtotal = pkgRoomPrice * nights;
    const pkgTaxes = Math.round(pkgSubtotal * 0.12);
    const pkgDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    const pkgTotal = Math.max(0, pkgSubtotal + pkgTaxes - pkgDiscount);

    const bookingPayload = {
      hotelId: hotel._id || hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      location: hotel.location,
      packageName: pkg.title,
      room: `${pkg.roomName} (${pkg.title})`,
      roomPrice: pkgRoomPrice,
      guests,
      checkIn,
      checkOut,
      nights,
      extras: pkg.inclusions,
      extrasTotal: 0,
      taxesAndFees: pkgTaxes,
      discount: pkgDiscount,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      totalPrice: pkgTotal,
    };

    if (!user) {
      showToast(`Please sign in or create an account to book the ${pkg.title}.`, "info");
      navigate("/login", {
        state: {
          returnTo: "/payment",
          bookingData: bookingPayload,
        },
      });
      return;
    }

    navigate("/payment", { state: bookingPayload });
  }

  const galleryImages = hotel.images?.length
    ? hotel.images
    : [
        hotel.image,
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="details-page">
        {/* Navigation Breadcrumb */}
        <div className="details-top-bar">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>All Stays</span>
          </button>

          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>{hotel.city || hotel.location}</span>
            <ChevronRight size={13} />
            <span className="current">{hotel.name}</span>
          </div>

          <div className="details-top-actions">
            <button
              className={`action-pill-btn ${favorite ? "active" : ""}`}
              onClick={handleHeartClick}
              title={favorite ? "Saved to wishlist" : "Save to wishlist"}
            >
              <Heart
                size={16}
                fill={favorite ? "#e53e3e" : "transparent"}
                color={favorite ? "#e53e3e" : "currentColor"}
              />
              <span>{favorite ? "Saved" : "Save"}</span>
            </button>

            <button className="action-pill-btn" onClick={handleShare} title="Share this stay">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="details-header-title">
          <div>
            <h1>{hotel.name}</h1>
            <p className="details-location-text">
              <MapPin size={16} />
              <span>{hotel.location}</span>
              <span className="bullet">·</span>
              <span className="category-tag">{hotel.category}</span>
            </p>
          </div>

          <div className="details-rating-badge">
            <div className="rating-score">
              <Star size={16} fill="#e5a93c" color="#e5a93c" />
              <strong>{hotel.rating}</strong>
            </div>
            <span className="reviews-tally">
              {hotel.reviewsCount || 140} verified guest reviews
            </span>
          </div>
        </div>

        {/* 5-Image Luxury Gallery */}
        <section className="luxury-gallery">
          <div className="gallery-main" onClick={() => { setActivePhotoIndex(0); setActivePhotoModal(true); }}>
            <img src={galleryImages[0]} alt={hotel.name} />
          </div>

          <div className="gallery-side-grid">
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="gallery-sub-thumb"
                onClick={() => { setActivePhotoIndex(idx + 1); setActivePhotoModal(true); }}
              >
                <img src={img} alt={`${hotel.name} preview ${idx + 2}`} />
              </div>
            ))}
          </div>

          <button
            className="view-all-photos-btn"
            onClick={() => { setActivePhotoIndex(0); setActivePhotoModal(true); }}
          >
            <Maximize2 size={15} />
            <span>View All Photos ({galleryImages.length})</span>
          </button>
        </section>

        {/* Key Highlights Strip */}
        <div className="highlights-strip">
          <div className="highlight-pill">
            <Sparkles size={18} className="highlight-icon" />
            <div>
              <strong>Superhost Certified</strong>
              <span>Rated 4.8+ by 100+ guests</span>
            </div>
          </div>
          <div className="highlight-pill">
            <ShieldCheck size={18} className="highlight-icon" />
            <div>
              <strong>Flexible Cancellation</strong>
              <span>Full refund up to 48 hours before check-in</span>
            </div>
          </div>
          <div className="highlight-pill">
            <Waves size={18} className="highlight-icon" />
            <div>
              <strong>Scenic Sanctuary</strong>
              <span>Unmatched views & serene surroundings</span>
            </div>
          </div>
          <div className="highlight-pill">
            <Utensils size={18} className="highlight-icon" />
            <div>
              <strong>Gourmet Dining</strong>
              <span>Farm-to-table organic regional fare</span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Details Left, Price Card Right */}
        <div className="details-grid">
          {/* Left Column */}
          <section className="details-main-content">
            {/* About Property */}
            <div className="details-block">
              <h2>About this property</h2>
              <p className="details-body-text">{hotel.description}</p>

              {hotel.highlights && (
                <div className="property-bullets">
                  {hotel.highlights.map((h, i) => (
                    <div key={i} className="property-bullet-item">
                      <Check size={16} className="check-bullet" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Selector */}
            <div className="details-block">
              <h2>Select your room type</h2>
              <p className="sub-instruction">
                Choose the suite or villa that best fits your travel style.
              </p>

              <div className="room-options-grid">
                {roomTypes.map((item) => {
                  const isSelected = room === item.name;
                  const nightlyRate = hotel.price + (item.extra || 0);

                  return (
                    <div
                      key={item.name}
                      className={`room-card-box ${isSelected ? "selected" : ""}`}
                      onClick={() => setRoom(item.name)}
                    >
                      <div className="room-card-top">
                        <div className="room-info-meta">
                          <span className="room-title">{item.name}</span>
                          <span className="room-spec">
                            <BedDouble size={14} /> {item.bed || "1 King Bed"} · {item.sqft || "450 sq.ft"} · Max {item.guests || 2} guests
                          </span>
                        </div>
                        <div className="room-price-meta">
                          <strong>₹{nightlyRate.toLocaleString("en-IN")}</strong>
                          <span>/ night</span>
                        </div>
                      </div>

                      <p className="room-desc">{item.desc}</p>

                      <div className="room-select-action">
                        <span className={`room-select-pill ${isSelected ? "active" : ""}`}>
                          {isSelected ? "Selected" : "Select Room"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stay Dates & Guests */}
            <div className="details-block" id="stay-dates">
              <h2>Your stay dates & guests</h2>
              <p className="sub-instruction">
                Rates automatically calculate based on your length of stay.
              </p>

              <div className="stay-picker-grid">
                <label className="picker-box">
                  <span className="picker-label">Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </label>

                <label className="picker-box">
                  <span className="picker-label">Check-out</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </label>

                <label className="picker-box full-width">
                  <span className="picker-label">Guests</span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Curated Vacation & Experience Packages */}
            <div className="details-block" id="packages-section">
              <div className="curated-pack-header">
                <span className="curated-eyebrow">ALL-INCLUSIVE CURATED OFFERS</span>
                <h2>Curated Stay & Experience Packages</h2>
                <p className="sub-instruction">
                  Exclusive packages combining luxury suites, signature excursions, and gourmet dining.
                  Guests can freely review all inclusions; sign-in is required to secure a reservation.
                </p>
              </div>

              <div className="packages-grid">
                {curatedPackages.map((pkg) => {
                  const pkgPerNight = hotel.price + pkg.extraPerNight;
                  return (
                    <div key={pkg.id} className="package-card-box">
                      <div className="package-card-top">
                        <span className="package-badge">{pkg.badge}</span>
                        <div className="package-price-wrap">
                          <strong>₹{pkgPerNight.toLocaleString("en-IN")}</strong>
                          <span>/ night</span>
                        </div>
                      </div>

                      <h3 className="package-title">{pkg.title}</h3>
                      <p className="package-tagline">{pkg.tagline}</p>
                      <p className="package-room-spec">
                        <BedDouble size={14} /> <span>Room: <strong>{pkg.roomName}</strong></span>
                      </p>

                      <div className="package-inclusions-list">
                        <span className="inclusions-label">Included in this package:</span>
                        {pkg.inclusions.map((inc, i) => (
                          <div key={i} className="package-inc-item">
                            <Check size={14} className="check-bullet" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={`package-book-btn ${!user ? "auth-cta" : ""}`}
                        onClick={() => handleBookPackage(pkg)}
                      >
                        {user ? (
                          <>
                            <span>Book This Package</span>
                            <ArrowRight size={16} />
                          </>
                        ) : (
                          <>
                            <UserRound size={16} />
                            <span>Sign in to Book Package</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="details-block">
              <h2>What this place offers</h2>
              <div className="amenities-grid-modern">
                {(hotel.amenities || [
                  "Free High-speed Wi-Fi",
                  "Outdoor Swimming Pool",
                  "Spa & Wellness Center",
                  "Gourmet Restaurant & Bar",
                  "24/7 Butler & Concierge",
                  "Complimentary Valet Parking",
                  "Air Conditioning",
                  "Electric Vehicle (EV) Charging",
                ]).map((amenity, idx) => (
                  <div key={idx} className="amenity-item">
                    <Check size={16} className="amenity-icon" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras / Experiences */}
            <div className="details-block">
              <h2>Add experiences & extras</h2>
              <p className="sub-instruction">
                Personalize your getaway with curated optional add-ons.
              </p>

              <div className="extras-selector-list">
                {availableExtras.map((item) => {
                  const isChecked = selectedExtras.includes(item.name);

                  return (
                    <label
                      key={item.name}
                      className={`extra-card-item ${isChecked ? "active" : ""}`}
                    >
                      <div className="extra-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleExtra(item.name)}
                        />
                      </div>
                      <div className="extra-text-wrap">
                        <strong>{item.name}</strong>
                        <p>{item.desc}</p>
                      </div>
                      <div className="extra-price-tag">
                        + ₹{item.price.toLocaleString("en-IN")}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Guest Reviews Section */}
            <div className="details-block reviews-block">
              <div className="reviews-header">
                <h2>Guest reviews & ratings</h2>
                <div className="reviews-aggregate">
                  <Star size={20} fill="#e5a93c" color="#e5a93c" />
                  <span className="big-rating">{hotel.rating}</span>
                  <span className="reviews-sub">
                    based on {hotel.reviewsCount || 140} verified stays
                  </span>
                </div>
              </div>

              {/* Review breakdown bars */}
              <div className="rating-metrics-grid">
                <div className="metric-row">
                  <span>Cleanliness & Hygiene</span>
                  <div className="metric-bar"><div className="metric-fill" style={{ width: "98%" }}></div></div>
                  <strong>4.9</strong>
                </div>
                <div className="metric-row">
                  <span>Accuracy of Photos</span>
                  <div className="metric-bar"><div className="metric-fill" style={{ width: "96%" }}></div></div>
                  <strong>4.8</strong>
                </div>
                <div className="metric-row">
                  <span>Staff & Hospitality</span>
                  <div className="metric-bar"><div className="metric-fill" style={{ width: "99%" }}></div></div>
                  <strong>5.0</strong>
                </div>
                <div className="metric-row">
                  <span>Location & Scenery</span>
                  <div className="metric-bar"><div className="metric-fill" style={{ width: "97%" }}></div></div>
                  <strong>4.9</strong>
                </div>
              </div>

              {/* Individual review cards */}
              <div className="review-cards-list">
                {(hotel.reviews || [
                  {
                    author: "Rohan & Priya Mehra",
                    rating: 5,
                    date: "October 2026",
                    comment:
                      "Spectacular hospitality from start to finish. The food was divine, the rooms were immaculate, and waking up here was pure therapy.",
                  },
                  {
                    author: "Ananya Iyer",
                    rating: 5,
                    date: "September 2026",
                    comment:
                      "One of the best stays we have ever booked in India. The concierge arranged our safari and sunset table with absolute perfection.",
                  },
                ]).map((rev, i) => (
                  <div key={i} className="review-card-item">
                    <div className="review-author-row">
                      <div className="review-avatar">{rev.author.charAt(0)}</div>
                      <div>
                        <strong>{rev.author}</strong>
                        <span>{rev.date}</span>
                      </div>
                      <div className="review-stars-row">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={13} fill="#e5a93c" color="#e5a93c" />
                        ))}
                      </div>
                    </div>
                    <p className="review-text">“{rev.comment}”</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies & FAQ */}
            <div className="details-block">
              <h2>Important stay information</h2>
              <div className="policies-grid">
                <div className="policy-item">
                  <Clock size={18} />
                  <div>
                    <strong>Check-in & Check-out</strong>
                    <p>Check-in from 2:00 PM · Check-out until 11:00 AM</p>
                  </div>
                </div>
                <div className="policy-item">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Cancellation & Refunds</strong>
                    <p>Free cancellation up to 48 hours prior to arrival for a 100% refund.</p>
                  </div>
                </div>
                <div className="policy-item">
                  <HelpCircle size={18} />
                  <div>
                    <strong>Government ID Required</strong>
                    <p>Valid government photo ID required for all adult guests at check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Sticky Reservation Summary Card */}
          <aside className="details-sidebar">
            <div className="sticky-price-card">
              <div className="price-card-header">
                <div className="nightly-rate-display">
                  <span className="price-currency">₹</span>
                  <span className="price-number">
                    {(hotel.price + (selectedRoomObj.extra || 0)).toLocaleString("en-IN")}
                  </span>
                  <span className="price-unit">/ night</span>
                </div>
                <div className="card-rating-mini">
                  <Star size={14} fill="#e5a93c" color="#e5a93c" />
                  <strong>{hotel.rating}</strong>
                </div>
              </div>

              {/* Stay parameters summary */}
              <div className="card-reservation-params">
                <div className="param-item">
                  <span className="param-title">Dates</span>
                  <span className="param-val">
                    {checkIn && checkOut
                      ? `${new Date(checkIn).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })} – ${new Date(checkOut).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })} (${nights} ${nights === 1 ? "night" : "nights"})`
                      : "Select dates below"}
                  </span>
                </div>

                <div className="param-item">
                  <span className="param-title">Room</span>
                  <span className="param-val">{selectedRoomObj.name}</span>
                </div>

                <div className="param-item">
                  <span className="param-title">Guests</span>
                  <span className="param-val">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="card-price-breakdown">
                <div className="breakdown-row">
                  <span>
                    ₹{(hotel.price + (selectedRoomObj.extra || 0)).toLocaleString("en-IN")} × {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                  <span>₹{roomTotal.toLocaleString("en-IN")}</span>
                </div>

                {extrasTotal > 0 && (
                  <div className="breakdown-row">
                    <span>Selected add-ons ({selectedExtras.length})</span>
                    <span>+ ₹{extrasTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="breakdown-row">
                  <span>Taxes & StaySphere service fee (12%)</span>
                  <span>+ ₹{taxesAndFees.toLocaleString("en-IN")}</span>
                </div>

                {discount > 0 && (
                  <div className="breakdown-row discount-row">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="discount-amount">- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="breakdown-divider"></div>

                <div className="breakdown-total-row">
                  <span>Total Amount</span>
                  <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
                </div>
                <span className="breakdown-guarantee">No hidden fees · Free cancellation guarantee</span>
              </div>

              {/* Promo Code Input Box */}
              <div className="card-coupon-section">
                <div className="coupon-header-row">
                  <Tag size={15} />
                  <span>Promo Code / Coupon</span>
                </div>

                {appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <div className="applied-coupon-text">
                      <Sparkles size={14} className="sparkle-gold" />
                      <span>
                        <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount.toLocaleString("en-IN")})
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
                      placeholder="Enter promo code (e.g. STAY1500)"
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

                {!appliedCoupon && (
                  <button
                    type="button"
                    className="quick-coupon-suggestion"
                    onClick={() => {
                      setAppliedCoupon({ code: "STAY1500", discount: 1500 });
                      showToast("Coupon STAY1500 applied: ₹1,500 discount!", "success");
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Have code <strong>STAY1500</strong>? Click to apply ₹1,500 OFF</span>
                  </button>
                )}
              </div>

              {/* User Sign-In Status / Verification Guard */}
              {user ? (
                <div className="card-user-status verified">
                  <ShieldCheck size={15} />
                  <span>Reserving as <strong>{user.name}</strong> <code>({user.email})</code></span>
                </div>
              ) : (
                <div className="card-user-status auth-alert">
                  <Lock size={15} />
                  <span>Sign-in required to reserve this property</span>
                </div>
              )}

              <button
                className={`search-btn booking-btn reserve-cta ${!user ? "auth-cta" : ""}`}
                onClick={handleProceedToPayment}
              >
                {user ? (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight size={17} />
                  </>
                ) : (
                  <>
                    <UserRound size={17} />
                    <span>Sign in to Reserve</span>
                  </>
                )}
              </button>

              <div className="booking-trust-points">
                <p><Check size={14} /> Instant confirmation</p>
                <p><Check size={14} /> 256-bit bank encryption</p>
                <p><Check size={14} /> 24/7 dedicated travel concierge</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Stays Recommendations */}
        {similarHotels.length > 0 && (
          <section className="similar-stays-section">
            <p className="eyebrow">EXPLORE MORE</p>
            <h2>Similar Stays You Might Love</h2>
            <div className="hotel-grid">
              {similarHotels.map((h) => (
                <article
                  key={h._id || h.id}
                  className="hotel-card"
                  onClick={() => navigate(`/hotels/${h._id || h.id}`)}
                >
                  <div className="hotel-image-wrapper">
                    <img src={h.image} alt={h.name} />
                    <div className="badge-row">
                      <span className="category-pill">{h.category}</span>
                    </div>
                  </div>
                  <div className="hotel-info">
                    <div className="hotel-heading">
                      <h3>{h.name}</h3>
                      <span className="rating">
                        <Star size={13} fill="#e5a93c" color="#e5a93c" />
                        <strong>{h.rating}</strong>
                      </span>
                    </div>
                    <p className="location">
                      <MapPin size={13} />
                      <span>{h.location}</span>
                    </p>
                    <div className="hotel-bottom">
                      <p className="price-text">
                        <strong>₹{h.price.toLocaleString("en-IN")}</strong>
                        <span> / night</span>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Photo Lightbox Modal */}
      {activePhotoModal && (
        <div className="lightbox-modal-overlay" onClick={() => setActivePhotoModal(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setActivePhotoModal(false)}
              aria-label="Close photo gallery"
            >
              <X size={24} />
            </button>

            <div className="lightbox-image-wrap">
              <img
                src={galleryImages[activePhotoIndex]}
                alt={`${hotel.name} gallery ${activePhotoIndex + 1}`}
              />
            </div>

            <div className="lightbox-nav-row">
              <button
                className="lightbox-nav-btn"
                onClick={() =>
                  setActivePhotoIndex((prev) =>
                    prev === 0 ? galleryImages.length - 1 : prev - 1
                  )
                }
              >
                Previous
              </button>
              <span className="lightbox-counter">
                {activePhotoIndex + 1} / {galleryImages.length}
              </span>
              <button
                className="lightbox-nav-btn"
                onClick={() =>
                  setActivePhotoIndex((prev) =>
                    prev === galleryImages.length - 1 ? 0 : prev + 1
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auth Modal Guard */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
