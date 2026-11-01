import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Award,
  Headphones,
  Check,
  Copy,
  Compass,
  Star,
  Trees,
  Waves,
  Mountain,
  Building2,
  Sunset,
  Flame,
  Hotel,
} from "lucide-react";
import Navbar from "../components/Navbar";
import HotelCard from "../components/HotelCard";
import { getHotels } from "../api";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  { id: "all", label: "All Stays", icon: Compass },
  { id: "Resort", label: "Wildlife & Nature", icon: Trees },
  { id: "Beach Resort", label: "Beachfront", icon: Waves },
  { id: "Mountain Hotel", label: "Mountain & Snow", icon: Mountain },
  { id: "Heritage Hotel", label: "Heritage Palaces", icon: Award },
  { id: "Backwater Resort", label: "Backwaters & Lakes", icon: Sunset },
  { id: "City Hotel", label: "City Luxury", icon: Building2 },
  { id: "Desert Resort", label: "Desert Dunes", icon: Flame },
];

const POPULAR_DESTINATIONS = [
  "All India",
  "Goa",
  "Jaipur",
  "Manali",
  "Kerala",
  "Ranthambore",
  "Rishikesh",
  "Srinagar",
  "Jaisalmer",
  "Mumbai",
];

export default function Home() {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [maxPrice, setMaxPrice] = useState(12000);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenity, setSelectedAmenity] = useState("all");
  const [couponCopied, setCouponCopied] = useState(false);

  useEffect(() => {
    getHotels()
      .then((data) => setHotels(data))
      .catch((err) => console.error("Could not load hotels", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort Logic
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // Destination search filter
        if (destination && destination !== "All India") {
          const query = destination.toLowerCase().trim();
          const matchLoc = hotel.location?.toLowerCase().includes(query);
          const matchName = hotel.name?.toLowerCase().includes(query);
          const matchCity = hotel.city?.toLowerCase().includes(query);
          const matchState = hotel.state?.toLowerCase().includes(query);
          if (!matchLoc && !matchName && !matchCity && !matchState) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all") {
          if (
            hotel.category !== selectedCategory &&
            !hotel.category?.toLowerCase().includes(selectedCategory.toLowerCase())
          ) {
            return false;
          }
        }

        // Max price filter
        if (hotel.price > maxPrice) {
          return false;
        }

        // Min rating filter
        if (minRating > 0 && hotel.rating < minRating) {
          return false;
        }

        // Amenity filter
        if (selectedAmenity !== "all") {
          const hasAmenity = hotel.amenities?.some((a) =>
            a.toLowerCase().includes(selectedAmenity.toLowerCase())
          );
          const hasPackage = hotel.packages?.some((p) =>
            p.toLowerCase().includes(selectedAmenity.toLowerCase())
          );
          if (!hasAmenity && !hasPackage) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // recommended
      });
  }, [
    hotels,
    destination,
    selectedCategory,
    maxPrice,
    minRating,
    selectedAmenity,
    sortBy,
  ]);

  function handleDestinationSelect(dest) {
    if (dest === "All India") {
      setDestination("");
    } else {
      setDestination(dest);
    }
    scrollToHotels();
  }

  function scrollToHotels() {
    const el = document.getElementById("hotels");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleSearchSubmit(e) {
    e?.preventDefault();
    scrollToHotels();
  }

  function resetFilters() {
    setDestination("");
    setSelectedCategory("all");
    setSortBy("recommended");
    setMaxPrice(12000);
    setMinRating(0);
    setSelectedAmenity("all");
  }

  function copyCoupon() {
    navigator.clipboard.writeText("STAY1500");
    try {
      sessionStorage.setItem("ss_active_coupon", "STAY1500");
    } catch {
      // Ignore
    }
    setCouponCopied(true);
    showToast("Coupon STAY1500 copied! Apply in the Reservation Summary during checkout.", "success");
    setTimeout(() => setCouponCopied(false), 3000);
  }

  return (
    <div className="page-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <Sparkles size={14} className="sparkle-icon" />
              <span>HANDPICKED LUXURY STAYS ACROSS INDIA</span>
            </div>

            <h1>
              Where extraordinary journeys
              <br />
              become unforgettable <span>stories.</span>
            </h1>

            <p className="hero-description">
              Discover boutique sanctuaries, royal heritage havelis, and secluded
              beachfront villas crafted for discerning travelers.
            </p>

            {/* Quick Destination Chips */}
            <div className="quick-dest-row">
              <span className="dest-label">Popular:</span>
              <div className="dest-chips-scroll">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    className={`dest-chip ${destination === dest ||
                        (dest === "All India" && !destination)
                        ? "active"
                        : ""
                      }`}
                    onClick={() => handleDestinationSelect(dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Search Bar */}
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <label className="search-field">
                <MapPin size={20} className="search-icon" />
                <span className="search-field-content">
                  <span className="search-title">Destination</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where would you love to stay?"
                    aria-label="Destination"
                  />
                </span>
              </label>

              <div className="search-divider"></div>

              <label className="search-field">
                <CalendarDays size={20} className="search-icon" />
                <span className="search-field-content">
                  <span className="search-title">Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => setCheckIn(e.target.value)}
                    aria-label="Check-in date"
                  />
                </span>
              </label>

              <div className="search-divider"></div>

              <label className="search-field">
                <CalendarDays size={20} className="search-icon" />
                <span className="search-field-content">
                  <span className="search-title">Check-out</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => setCheckOut(e.target.value)}
                    aria-label="Check-out date"
                  />
                </span>
              </label>

              <div className="search-divider"></div>

              <label className="search-field">
                <Users size={20} className="search-icon" />
                <span className="search-field-content">
                  <span className="search-title">Guests</span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    aria-label="Number of guests"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </span>
              </label>

              <button type="submit" className="search-btn">
                <Search size={18} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Trust Highlights Strip */}
          <div className="trust-strip">
            <div className="trust-item">
              <ShieldCheck size={20} />
              <div>
                <strong>100% Verified Stays</strong>
                <span>Audited for luxury & hygiene</span>
              </div>
            </div>
            <div className="trust-item">
              <Award size={20} />
              <div>
                <strong>Best Rate Guarantee</strong>
                <span>No hidden booking charges</span>
              </div>
            </div>
            <div className="trust-item">
              <Headphones size={20} />
              <div>
                <strong>24/7 Dedicated Concierge</strong>
                <span>Assistance whenever you need</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="category-section">
          <div className="category-tabs-container">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`category-tab ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={18} className="cat-icon" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Hotel Grid & Filter Bar Section */}
        <section className="hotels-section" id="hotels">
          <div className="section-header-row">
            <div>
              <p className="eyebrow">CURATED COLLECTION</p>
              <h2>Stays Worth Discovering</h2>
              <p className="section-subtext">
                Handpicked resorts, havelis, and retreats with memorable experiences.
              </p>
            </div>

            {/* Filter & Sorting Controls */}
            <div className="filter-controls-wrap">
              <div className="filter-select-group">
                <SlidersHorizontal size={16} className="filter-icon" />
                <span className="filter-label">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="recommended">Featured / Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Guest Rating</option>
                </select>
              </div>

              {/* Price filter toggle */}
              <div className="price-slider-wrap">
                <span className="filter-label">Max: ₹{maxPrice.toLocaleString("en-IN")}</span>
                <input
                  type="range"
                  min="3000"
                  max="12000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-range-input"
                />
              </div>

              {/* Reset button if filters applied */}
              {(destination ||
                selectedCategory !== "all" ||
                maxPrice < 12000 ||
                sortBy !== "recommended") && (
                  <button className="reset-filter-btn" onClick={resetFilters}>
                    Clear filters
                  </button>
                )}
            </div>
          </div>

          {/* Results count pill */}
          <div className="results-counter">
            <span>
              Showing <strong>{filteredHotels.length}</strong> {filteredHotels.length === 1 ? "luxury stay" : "luxury stays"}
              {destination ? ` in "${destination}"` : " in India"}
            </span>
          </div>

          {/* Hotel Grid */}
          {loading ? (
            <div className="hotel-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="hotel-skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-line full"></div>
                    <div className="skeleton-line half"></div>
                    <div className="skeleton-line third"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="empty-results-box">
              <Compass size={48} className="empty-icon" />
              <h3>No stays found matching your criteria</h3>
              <p>
                Try widening your price range or clearing destination filters to explore more
                curated properties.
              </p>
              <button className="search-btn reset-cta" onClick={resetFilters}>
                View all stays
              </button>
            </div>
          ) : (
            <div className="hotel-grid">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel._id || hotel.id} hotel={hotel} />
                // <HotelCard key={hotel.id || hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </section>

        {/* Promo Launch Coupon Banner */}
        <section className="promo-banner-section">
          <div className="promo-banner-card">
            <div className="promo-text-side">
              <span className="promo-eyebrow">EXCLUSIVE WELCOME OFFER</span>
              <h2>Get ₹1,500 off your first getaway</h2>
              <p>
                Book any stay of 2 nights or more and apply code <strong>STAY1500</strong> during
                reservation. Valid across all verified partner properties.
              </p>
              <div className="promo-coupon-box">
                <span className="coupon-code">STAY1500</span>
                <button className="coupon-copy-btn" onClick={copyCoupon}>
                  {couponCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{couponCopied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <div className="promo-guide-badge">
                <Sparkles size={13} className="sparkle-gold" />
                <span>
                  <strong>Where to put this code?</strong> Apply <strong>STAY1500</strong> under{" "}
                  <em>"Promo Code / Coupon"</em> in the Reservation Summary on any hotel details or payment checkout page!
                </span>
              </div>
            </div>
            <div className="promo-visual-side">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Retreat Pool"
                className="promo-image"
              />
            </div>
          </div>
        </section>

        {/* Unforgettable Experiences Section */}
        <section className="experience-banner" id="experiences">
          <div className="experience-inner">
            <p className="eyebrow">MORE THAN JUST A STAY</p>
            <h2>Immersive Experiences Crafted for You</h2>
            <p className="exp-lead">
              Every stay with StaySphere includes access to bespoke excursions, authentic culinary
              gatherings, and private adventures.
            </p>

            <div className="experiences-grid">
              <div className="experience-tile">
                <img
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"
                  alt="Tiger Safari"
                />
                <div className="exp-overlay">
                  <h4>Tiger Safari & Wildlife Drives</h4>
                  <p>Guided by senior naturalists through protected national corridors.</p>
                </div>
              </div>

              <div className="experience-tile">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80"
                  alt="Backwater Cruise"
                />
                <div className="exp-overlay">
                  <h4>Private Houseboat Cruises</h4>
                  <p>Sunset sailings along palm-fringed Kerala waterways with fresh coconut toddy.</p>
                </div>
              </div>

              <div className="experience-tile">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                  alt="Chef's Table Dining"
                />
                <div className="exp-overlay">
                  <h4>Royal Courtyard Dinners</h4>
                  <p>Seven-course Rajput and Nawabi royal banquets with live classical sitar.</p>
                </div>
              </div>

              <div className="experience-tile">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                  alt="Himalayan Treks"
                />
                <div className="exp-overlay">
                  <h4>Alpine Treks & Stargazing</h4>
                  <p>Trek through pine scented valleys and camp beneath crystal Himalayan skies.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose StaySphere Section */}
        <section className="why-section">
          <div className="section-heading text-center">
            <p className="eyebrow">THE STAYSPHERE DIFFERENCE</p>
            <h2>Hospitality elevated to an art form</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Award size={26} />
              </div>
              <h3>100% Curated Quality</h3>
              <p>
                We inspect every property in person. Only the top 5% of boutique hotels and resorts
                meet our design and service standards.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={26} />
              </div>
              <h3>Seamless & Secure Booking</h3>
              <p>
                Instant confirmation with bank-grade UPI and card encryption. Flexible cancellation
                options give you complete peace of mind.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Sparkles size={26} />
              </div>
              <h3>Inclusive Experiences</h3>
              <p>
                Complimentary gourmet breakfasts, curated nature walks, and personalized greetings
                are woven into every reservation.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Headphones size={26} />
              </div>
              <h3>Personal Travel Host</h3>
              <p>
                Need restaurant reservations, private airport transfers, or itinerary changes? Your
                dedicated StaySphere host is a message away.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Testimonials Section */}
        <section className="testimonials-section">
          <div className="section-heading text-center">
            <p className="eyebrow">STORIES FROM TRAVELERS</p>
            <h2>Memories that linger long after the trip</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#e5a93c" color="#e5a93c" />
                ))}
              </div>
              <p className="testimonial-quote">
                “Our anniversary at The Forest Retreat was pure poetry. The morning tiger safari was
                exhilarating, and the candlelit dinner in the forest was unforgettable.”
              </p>
              <div className="testimonial-author">
                <span className="author-name">Aditya & Radhika Roy</span>
                <span className="author-trip">Stayed at The Forest Retreat, Ranthambore</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#e5a93c" color="#e5a93c" />
                ))}
              </div>
              <p className="testimonial-quote">
                “Ocean Pearl Resort in Goa exceeded every expectation. Direct beach access, spotless
                rooms, and an incredible sunset deck made it the best holiday we have ever had.”
              </p>
              <div className="testimonial-author">
                <span className="author-name">Priya Sundaram</span>
                <span className="author-trip">Stayed at Ocean Pearl Resort, Goa</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#e5a93c" color="#e5a93c" />
                ))}
              </div>
              <p className="testimonial-quote">
                “The Mountain View Chalets in Manali gave us waking views of fresh snow right from
                the bed. Booking via StaySphere was effortless and the staff took care of everything.”
              </p>
              <div className="testimonial-author">
                <span className="author-name">Kunal & Sneha Mehra</span>
                <span className="author-trip">Stayed at Mountain View Stay, Manali</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Luxury Footer */}
      <footer className="footer" id="about">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="brand footer-brand">
              <Hotel size={24} />
              <span>StaySphere</span>
            </div>
            <p className="footer-desc">
              India's premier collection of curated luxury stays, boutique resorts, and heritage
              retreats. Dedicated to crafting memorable travel experiences with authentic
              hospitality.
            </p>
            <p className="footer-support-phone">
              24/7 Guest Concierge: <strong>+91 (800) 247-STAY</strong>
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Top Destinations</h4>
            <ul>
              <li><button onClick={() => handleDestinationSelect("Goa")}>Goa Beach Resorts</button></li>
              <li><button onClick={() => handleDestinationSelect("Jaipur")}>Jaipur Heritage Palaces</button></li>
              <li><button onClick={() => handleDestinationSelect("Manali")}>Manali Mountain Chalets</button></li>
              <li><button onClick={() => handleDestinationSelect("Kerala")}>Kerala Backwater Stays</button></li>
              <li><button onClick={() => handleDestinationSelect("Ranthambore")}>Ranthambore Safari Lodges</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Experiences</h4>
            <ul>
              <li><a href="#experiences">Tiger Safari Expeditions</a></li>
              <li><a href="#experiences">Sunset Catamaran Cruises</a></li>
              <li><a href="#experiences">Ayurvedic Wellness & Spa</a></li>
              <li><a href="#experiences">Royal Courtyard Banquets</a></li>
              <li><a href="#experiences">Himalayan Alpine Treks</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>StaySphere</h4>
            <ul>
              <li><a href="#about">About Our Vision</a></li>
              <li><a href="#hotels">Curated Stays</a></li>
              <li><a href="/my-bookings">Manage Bookings</a></li>
              <li><a href="/saved">Saved Wishlist</a></li>
              <li><a href="#about">Host with StaySphere</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 StaySphere Hospitality Group. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="#about">Privacy Policy</a>
            <span>·</span>
            <a href="#about">Terms of Service</a>
            <span>·</span>
            <a href="#about">Cancellation Policy</a>
            <span>·</span>
            <a href="#about">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
