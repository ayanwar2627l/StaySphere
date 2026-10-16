import { useState, useEffect } from "react";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import HotelCard from "../components/HotelCard";
import api from "../api";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/hotels")
      .then((response) => setHotels(response.data))
      .catch(() => setError("Could not load hotels. Please try again."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <p className="eyebrow">STAYS, EVENTS & EXPERIENCES</p>

          <h1>
            Your next story
            <br />
            starts <span>here.</span>
          </h1>

          <p className="hero-description">
            Find your perfect stay, celebrate special moments,
            and discover unforgettable experiences.
          </p>

          <div className="search-bar">
            <label>
              <MapPin size={19} />
              <span>
                Destination
                <input placeholder="Where do you want to go?" />
              </span>
            </label>

            <label>
              <CalendarDays size={19} />
              <span>
                Check-in
                <input type="date" />
              </span>
            </label>

            <label>
              <Users size={19} />
              <span>
                Guests
                <select defaultValue="2">
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="3">3 guests</option>
                  <option value="4">4 guests</option>
                </select>
              </span>
            </label>

            <button
              className="search-btn"
              onClick={() =>
                document.getElementById("hotels")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              <Search size={18} />
              Explore
            </button>
          </div>
        </section>

        <section className="hotels-section" id="hotels">
          <div className="section-heading">
            <div>
              <p className="eyebrow">HANDPICKED FOR YOU</p>
              <h2>Stays worth discovering</h2>
              <p>Find a place to stay and experiences to remember.</p>
            </div>
          </div>

          <div className="hotel-grid">
            {loading ? (
              <p>Loading hotels...</p>
            ) : error ? (
              <p>{error}</p>
            ) : hotels.length === 0 ? (
              <p>No hotels available yet.</p>
            ) : (
              hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))
            )}
          </div>
        </section>

        <section className="experience-banner" id="experiences">
          <div>
            <p className="eyebrow">MORE THAN JUST A STAY</p>
            <h2>Make every trip an experience.</h2>
            <p>
              Add safaris, guided tours, meals, and more to your
              next getaway.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer" id="about">
        StaySphere © 2026 · Stays, celebrations and experiences.
      </footer>
    </>
  );
}
