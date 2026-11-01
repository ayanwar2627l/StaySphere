import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Compass } from "lucide-react";
import Navbar from "../components/Navbar";
import HotelCard from "../components/HotelCard";
import { getHotels } from "../api";
import { useWishlist } from "../context/WishlistContext";

export default function SavedStays() {
  const { wishlist } = useWishlist();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotels()
      .then((data) => setHotels(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const savedHotels = hotels.filter((h) =>
    wishlist.some((id) => String(id) === String(h._id || h.id))
  );

  return (
    <div className="page-container">
      <Navbar />

      <main className="details-page saved-stays-page">
        <div className="bookings-header-row">
          <div>
            <p className="eyebrow">YOUR WISHLIST</p>
            <h1>Saved Luxury Stays</h1>
            <p className="sub-instruction">
              Your curated collection of retreats, havelis, and resorts saved for future travels.
            </p>
          </div>

          <Link to="/" className="search-btn explore-more-btn">
            <Compass size={17} />
            <span>Discover More</span>
          </Link>
        </div>

        {loading ? (
          <p className="loading-text">Loading your saved stays...</p>
        ) : savedHotels.length === 0 ? (
          <div className="empty-bookings-box">
            <Heart size={48} className="empty-icon heart-empty" />
            <h3>Your wishlist is empty</h3>
            <p>
              Tap the heart icon on any hotel card to bookmark properties you'd love to visit
              later.
            </p>
            <Link to="/" className="search-btn">
              Explore Luxury Stays
            </Link>
          </div>
        ) : (
          <div className="hotel-grid">
            {savedHotels.map((hotel) => (
              <HotelCard key={hotel._id || hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
