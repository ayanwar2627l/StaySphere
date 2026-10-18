require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Hotel = require("./models/Hotel");
const Booking = require("./models/Booking");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

const app = express();

app.use(
  cors({
    origin: true,          // reflect any origin (dev-friendly)
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("StaySphere API is running!");
});

// Get all hotels
app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch hotels",
    });
  }
});

// Get one hotel by ID
app.get("/api/hotels/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hotel" });
  }
});

// Create a booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      room,
      guests,
      checkIn,
      checkOut,
      nights,
      extras,
      totalPrice,
      paymentMethod,
      upiId,
    } = req.body;

    if (!hotelId || !checkIn || !checkOut || !room) {
      return res
        .status(400)
        .json({ message: "Missing required booking fields." });
    }

    const booking = await Booking.create({
      hotelId,
      hotelName,
      room,
      guests,
      checkIn,
      checkOut,
      nights,
      extras: extras || [],
      totalPrice,
      paymentMethod: paymentMethod || "UPI",
      upiId: upiId || "",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking." });
  }
});

// ── Auth routes ──────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Registration failed." });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });