const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Always load .env from the backend directory regardless of where node was invoked
dotenv.config({ path: path.resolve(__dirname, ".env") });

const Hotel = require("./models/Hotel");
const Booking = require("./models/Booking");
const User = require("./models/User");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports, configured CLIENT_URL, and requests with no origin (e.g. mobile apps, curl)
      if (
        !origin ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health & DB status check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("StaySphere API is running!");
});

// ── Dynamic Hotel Endpoints ───────────────────────────────────────────────

// Dynamic Get all hotels (Search, Filter, Sort, Price Bounds)
app.get("/api/hotels", async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, rating, sort } = req.query;

    const query = {};

    // Keyword search across hotel name, location, description, highlights, tags
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: regex },
        { location: regex },
        { city: regex },
        { state: regex },
        { tagline: regex },
        { description: regex },
        { category: regex },
      ];
    }

    // Category filter
    if (category && category.trim() && category !== "all") {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Location / City filter
    if (location && location.trim() && location !== "All India") {
      query.$or = [
        { location: new RegExp(location.trim(), "i") },
        { city: new RegExp(location.trim(), "i") },
        { state: new RegExp(location.trim(), "i") },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    else if (sort === "price_desc") sortOptions = { price: -1 };
    else if (sort === "rating") sortOptions = { rating: -1 };
    else if (sort === "popular") sortOptions = { reviewsCount: -1 };

    const hotels = await Hotel.find(query).sort(sortOptions);
    res.status(200).json(hotels);
  } catch (error) {
    console.error("Failed to fetch hotels:", error.message);
    res.status(500).json({ message: "Failed to fetch hotels" });
  }
});

// Dynamic Get one hotel by ID, customId, or Name
app.get("/api/hotels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let hotel = null;

    if (mongoose.isValidObjectId(id)) {
      hotel = await Hotel.findById(id);
    }

    if (!hotel) {
      hotel = await Hotel.findOne({
        $or: [
          { customId: id },
          { name: new RegExp(id.replace(/-/g, " "), "i") },
        ],
      });
    }

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error("Failed to fetch hotel:", error.message);
    res.status(500).json({ message: "Failed to fetch hotel" });
  }
});

// Dynamic Review Submission for a hotel
app.post("/api/hotels/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, userEmail, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ message: "Name, rating, and review comment are required." });
    }

    let hotel = null;
    if (mongoose.isValidObjectId(id)) {
      hotel = await Hotel.findById(id);
    }
    if (!hotel) {
      hotel = await Hotel.findOne({
        $or: [{ customId: id }, { name: new RegExp(id.replace(/-/g, " "), "i") }],
      });
    }

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const newReview = {
      userName: userName.trim(),
      userEmail: (userEmail || "").trim().toLowerCase(),
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    };

    if (!hotel.reviews) hotel.reviews = [];
    hotel.reviews.unshift(newReview);

    // Recalculate average rating & reviewsCount dynamically
    const totalScore = hotel.reviews.reduce((sum, r) => sum + r.rating, 0);
    hotel.rating = Number((totalScore / hotel.reviews.length).toFixed(2));
    hotel.reviewsCount = hotel.reviews.length;

    await hotel.save();

    console.log(`⭐ Dynamic review recorded for ${hotel.name} by ${newReview.userName} (${newReview.rating}★)`);
    res.status(201).json({ hotel, review: newReview });
  } catch (error) {
    console.error("Failed to add review:", error.message);
    res.status(500).json({ message: "Failed to add review" });
  }
});

// ── Dynamic Wishlist Endpoints ─────────────────────────────────────────────

// Get user wishlist
app.get("/api/users/wishlist", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "User email required." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    res.json(user ? user.wishlist || [] : []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

// Toggle user wishlist item
app.post("/api/users/wishlist", async (req, res) => {
  try {
    const { email, hotelId, action } = req.body;
    if (!email || !hotelId) {
      return res.status(400).json({ message: "Email and hotelId required." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (action === "remove") {
      user.wishlist = (user.wishlist || []).filter((id) => String(id) !== String(hotelId));
    } else {
      if (!user.wishlist) user.wishlist = [];
      if (!user.wishlist.includes(String(hotelId))) {
        user.wishlist.push(String(hotelId));
      }
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
});

// Create a booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      userEmail,
      userName,
      room,
      guests,
      checkIn,
      checkOut,
      nights,
      extras,
      discount,
      couponCode,
      totalPrice,
      paymentMethod,
      upiId,
    } = req.body;

    // Strict authentication guard: reject guest or empty user bookings
    if (!userEmail || userEmail === "guest@staysphere.com" || !userEmail.includes("@")) {
      return res.status(401).json({
        message: "Authentication required. Please sign in with a verified account to complete a booking."
      });
    }

    if (!hotelId || !hotelName || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({ message: "Missing required booking fields." });
    }

    const booking = await Booking.create({
      hotelId,
      hotelName,
      userEmail,
      userName: userName || "",
      room: room || "Standard Room",
      guests: guests || 1,
      checkIn,
      checkOut,
      nights: nights || 1,
      extras: extras || [],
      discount: discount || 0,
      couponCode: couponCode || "",
      totalPrice,
      paymentMethod: paymentMethod || "UPI",
      upiId: upiId || "",
      status: "Confirmed",
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Failed to create booking:", error.message);
    res.status(500).json({ message: "Failed to create booking." });
  }
});

// Get all bookings (optional filter by email)
app.get("/api/bookings", async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email
      ? { userEmail: { $regex: new RegExp(`^${email.trim()}$`, "i") } }
      : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Cancel a booking
app.patch("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Failed to cancel booking:", error.message);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

// ── Auth routes (MongoDB Persistent Storage) ──────────────────────────────

// Register: Create & Store User in MongoDB
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Email already registered in database. Please sign in." });
    }

    // Persist new user in MongoDB database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    console.log(`✅ Stored registered user in MongoDB: ${user.name} (${user.email})`);

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET || "staysphere_secret_key_2026",
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, name: user.name, email: user.email });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed." });
  }
});

// Login: Store account in MongoDB if new, or verify credentials if existing
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-store new user into MongoDB database for future calls
      const derivedName =
        name?.trim() ||
        (normalizedEmail.split("@")[0].charAt(0).toUpperCase() +
          normalizedEmail.split("@")[0].slice(1));

      user = await User.create({
        name: derivedName,
        email: normalizedEmail,
        password,
      });

      console.log(`✅ Stored sign-in account in MongoDB for future calls: ${user.name} (${user.email})`);
    } else {
      // Existing user in MongoDB: verify password
      let match = await user.matchPassword(password);
      if (!match && user.password === password) {
        // Upgrade legacy plain-text password to bcrypt hash
        user.password = password;
        await user.save();
        match = true;
      }
      if (!match) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET || "staysphere_secret_key_2026",
      { expiresIn: "7d" }
    );

    res.json({ token, name: user.name, email: user.email });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed." });
  }
});

// Get all stored accounts from MongoDB (passwords omitted)
app.get("/api/auth/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Seed default test user if needed
async function seedDefaultTestUser() {
  try {
    const exists = await User.findOne({ email: "test@staysphere.com" });
    if (!exists) {
      await User.create({
        name: "Aryan (Test User)",
        email: "test@staysphere.com",
        password: "test1234",
      });
      console.log("✅ Seeded test account in MongoDB: test@staysphere.com / test1234");
    } else {
      const isMatch = await exists.matchPassword("test1234");
      if (!isMatch) {
        exists.password = "test1234";
        await exists.save();
        console.log("✅ Re-synced bcrypt password hash for test@staysphere.com");
      }
    }
  } catch (err) {
    console.warn("Test user seed check:", err.message);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB Atlas
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("🌿 Connected to MongoDB Atlas database successfully!");
      await seedDefaultTestUser();
    })
    .catch((error) => {
      console.error("⚠️  MongoDB connection note:", error.message);
      console.log("ℹ️  Note: If you are using MongoDB Atlas, make sure your IP is whitelisted (or 0.0.0.0/0 allowed).");
    });
}
