
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import hotels from "../data/hotels";

const roomTypes = [
  { name: "Standard Room", extra: 0 },
  { name: "Deluxe Room", extra: 1500 },
  { name: "Suite", extra: 3000 },
];

const extras = [
  { name: "Breakfast", price: 500 },
  { name: "Wildlife Safari", price: 4000 },
  { name: "Airport Pickup", price: 1200 },
  { name: "Guided Tour", price: 1500 },
];

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hotel = hotels.find((item) => item.id === Number(id));

  const [room, setRoom] = useState("Standard Room");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);

  if (!hotel) {
    return (
      <div className="not-found">
        <h2>Hotel not found</h2>
        <button onClick={() => navigate("/")}>
          Back to hotels
        </button>
      </div>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(checkOut) - new Date(checkIn)) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  const selectedRoom = roomTypes.find((item) => item.name === room);

  const roomTotal =
    (hotel.price + selectedRoom.extra) * Math.max(nights, 1);

  const extrasTotal = extras.reduce((total, item) => {
    return selectedExtras.includes(item.name)
      ? total + item.price
      : total;
  }, 0);

  const totalPrice = roomTotal + extrasTotal;

  function toggleExtra(name) {
    setSelectedExtras((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function handleBooking() {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      alert("Check-out must be after check-in.");
      return;
    }

    navigate("/booking", {
      state: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        room,
        guests,
        checkIn,
        checkOut,
        nights,
        extras: selectedExtras,
        totalPrice,
      },
    });
  }

  return (
    <>
      <Navbar />

      <main className="details-page">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to hotels
        </button>

        <div className="details-grid">
          <section className="details-main">
            <img
              className="details-image"
              src={hotel.image}
              alt={hotel.name}
            />

            <div className="details-heading">
              <div>
                <h1>{hotel.name}</h1>
                <p className="location">
                  <MapPin size={16} />
                  {hotel.location}
                </p>
              </div>

              <span className="rating">
                <Star size={16} fill="currentColor" />
                {hotel.rating}
              </span>
            </div>

            <p className="details-description">
              Enjoy a comfortable stay with optional experiences
              to make your trip more memorable.
            </p>

            <h2>Choose your room</h2>

            <div className="room-list">
              {roomTypes.map((item) => (
                <button
                  key={item.name}
                  className={`room-option ${
                    room === item.name ? "selected" : ""
                  }`}
                  onClick={() => setRoom(item.name)}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.extra === 0
                        ? "Base room rate"
                        : `₹${item.extra.toLocaleString("en-IN")} extra per night`}
                    </small>
                  </span>

                  <span>
                    ₹
                    {(hotel.price + item.extra).toLocaleString("en-IN")}
                    /night
                  </span>
                </button>
              ))}
            </div>

            <h2>Your stay</h2>

            <div className="date-fields">
              <label>
                Check-in
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </label>

              <label>
                Check-out
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </label>
            </div>

            <label className="guest-field">
              Number of guests
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </label>

            <h2>Customize your experience</h2>
            <p className="details-description">
              Select optional extras for your trip.
            </p>

            <div className="extras-list">
              {extras.map((item) => (
                <label className="extra-option" key={item.name}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      + ₹{item.price.toLocaleString("en-IN")}
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(item.name)}
                    onChange={() => toggleExtra(item.name)}
                  />
                </label>
              ))}
            </div>
          </section>

          <aside className="price-card">
            <p className="eyebrow">YOUR RESERVATION</p>
            <h2>Price summary</h2>

            <div className="price-line">
              <span>Room per night</span>
              <span>
                ₹
                {(hotel.price + selectedRoom.extra).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="price-line">
              <span>Nights</span>
              <span>{nights > 0 ? nights : 0}</span>
            </div>

            <div className="price-line">
              <span>Selected extras</span>
              <span>₹{extrasTotal.toLocaleString("en-IN")}</span>
            </div>

            {selectedExtras.map((name) => (
              <p className="included-item" key={name}>
                <Check size={14} /> {name}
              </p>
            ))}

            <div className="price-total">
              <span>Total estimate</span>
              <strong>
                ₹{totalPrice.toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              className="search-btn booking-btn"
              onClick={handleBooking}
            >
              Continue to booking
            </button>

            <p className="price-note">
              Demo pricing only. Availability and final charges
              will be verified by the backend later.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
