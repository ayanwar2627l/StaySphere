import { useState } from "react";
import { MapPin, Star, ArrowUpRight, Heart, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { showToast } = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);

  const favorite = isFavorite(hotel._id || hotel.id);

  function handleHeartClick(e) {
    e.stopPropagation();
    const added = toggleFavorite(hotel._id || hotel.id);
    if (added) {
      showToast(`Added "${hotel.name}" to your Saved Stays`, "success");
    } else {
      showToast(`Removed from your Saved Stays`, "info");
    }
  }

  function openHotel() {
    navigate(`/hotels/${hotel._id || hotel.id}`);
  }

  // Calculate discount percentage if originalPrice exists
  const discount =
    hotel.originalPrice && hotel.originalPrice > hotel.price
      ? Math.round(((hotel.originalPrice - hotel.price) / hotel.originalPrice) * 100)
      : null;

  return (
    <article className="hotel-card group" onClick={openHotel}>
      <div className="hotel-image-wrapper">
        <img
          src={hotel.image}
          alt={hotel.name}
          className={`hotel-image-img ${imgLoaded ? "loaded" : "loading"}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          className={`wishlist-btn ${favorite ? "active" : ""}`}
          onClick={handleHeartClick}
          aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
          title={favorite ? "Saved to Wishlist" : "Save to Wishlist"}
        >
          <Heart
            size={18}
            className={`heart-icon ${favorite ? "fill-red" : ""}`}
            fill={favorite ? "#e53e3e" : "transparent"}
            color={favorite ? "#e53e3e" : "#ffffff"}
          />
        </button>

        {/* Badges */}
        <div className="badge-row">
          <span className="category-pill">{hotel.category}</span>
          {discount && <span className="discount-pill">{discount}% OFF</span>}
          {hotel.badge && <span className="custom-badge"><Sparkles size={11} /> {hotel.badge}</span>}
        </div>
      </div>

      <div className="hotel-info">
        <div className="hotel-heading">
          <h3 title={hotel.name}>{hotel.name}</h3>
          <span className="rating" title={`${hotel.rating} out of 5 stars`}>
            <Star size={14} fill="#e5a93c" color="#e5a93c" />
            <strong>{hotel.rating}</strong>
            {hotel.reviewsCount && <span className="review-count">({hotel.reviewsCount})</span>}
          </span>
        </div>

        <p className="location">
          <MapPin size={14} />
          <span>{hotel.location}</span>
        </p>

        {hotel.tagline && <p className="hotel-tagline">{hotel.tagline}</p>}

        {/* Included perks & packages */}
        <div className="package-tags">
          {hotel.packages?.slice(0, 3).map((pkg) => (
            <span key={pkg} className="package-tag">
              <Check size={11} /> {pkg}
            </span>
          ))}
        </div>

        <div className="hotel-bottom">
          <div className="price-block">
            {hotel.originalPrice && (
              <span className="original-price">
                ₹{hotel.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            <p className="price-text">
              <strong>₹{hotel.price.toLocaleString("en-IN")}</strong>
              <span> / night</span>
            </p>
            <span className="tax-inclusive">Includes all taxes & fees</span>
          </div>

          <button
            className="view-btn"
            onClick={openHotel}
            aria-label={`View details of ${hotel.name}`}
          >
            <span>Details</span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
