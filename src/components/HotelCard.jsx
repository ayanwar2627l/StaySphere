
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();

  function openHotel() {
    navigate(`/hotels/${hotel._id}`);
  }

  return (
    <article className="hotel-card">
      <div
        className="hotel-image"
        onClick={openHotel}
        style={{ cursor: "pointer" }}
      >
        <img src={hotel.image} alt={hotel.name} />
        <span className="category">{hotel.category}</span>
      </div>

      <div className="hotel-info">
        <div className="hotel-heading">
          <h3>{hotel.name}</h3>
          <span className="rating">
            <Star size={15} fill="currentColor" />
            {hotel.rating}
          </span>
        </div>

        <p className="location">
          <MapPin size={15} />
          {hotel.location}
        </p>

        <div className="package-tags">
          {hotel.packages.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="hotel-bottom">
          <p>
            <strong>
              ₹{hotel.price.toLocaleString("en-IN")}
            </strong>
            <span> / night</span>
          </p>

          <button
            className="view-btn"
            onClick={openHotel}
            aria-label={`View ${hotel.name}`}
          >
            <ArrowUpRight size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}
