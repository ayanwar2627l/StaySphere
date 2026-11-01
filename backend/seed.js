const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Hotel = require("./models/Hotel");
const User = require("./models/User");

const hotels = [
  {
    name: "The Forest Retreat",
    location: "Ranthambore, Rajasthan",
    price: 6500,
    rating: 4.8,
    category: "Resort",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Wildlife Safari"],
  },
  {
    name: "Ocean Pearl Resort",
    location: "Goa, India",
    price: 4800,
    rating: 4.6,
    category: "Beach Resort",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Airport Pickup"],
  },
  {
    name: "Mountain View Stay",
    location: "Manali, Himachal Pradesh",
    price: 3500,
    rating: 4.7,
    category: "Mountain Hotel",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80%20replacement%20a%20hotel%20imaage",
    packages: ["Breakfast", "Guided Trek"],
  },
  {
    name: "Royal Heritage Palace",
    location: "Jaipur, Rajasthan",
    price: 8500,
    rating: 4.9,
    category: "Heritage Hotel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "City Tour"],
  },
  {
    name: "Backwater Bliss",
    location: "Alleppey, Kerala",
    price: 5200,
    rating: 4.7,
    category: "Backwater Resort",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Houseboat Tour"],
  },
  {
    name: "The Urban Nest",
    location: "Bengaluru, Karnataka",
    price: 3200,
    rating: 4.4,
    category: "City Hotel",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Airport Pickup"],
  },
  {
    name: "Snowpeak Grand",
    location: "Srinagar, Jammu and Kashmir",
    price: 7200,
    rating: 4.8,
    category: "Mountain Resort",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Guided Trek"],
  },
  {
    name: "The Riverside Retreat",
    location: "Rishikesh, Uttarakhand",
    price: 4100,
    rating: 4.5,
    category: "Riverside Resort",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Rafting Experience"],
  },
  {
    name: "Marine Bay Hotel",
    location: "Mumbai, Maharashtra",
    price: 6800,
    rating: 4.6,
    category: "Luxury Hotel",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Airport Pickup"],
  },
  {
    name: "Golden Sands Escape",
    location: "Jaisalmer, Rajasthan",
    price: 5600,
    rating: 4.7,
    category: "Desert Resort",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD_WaAC2hGMfENEtidH7Edyx43OtoGt7zA2qBBIAITAQ&s=10",
    packages: ["Breakfast", "Desert Safari"],
  },
];

const testUsers = [
  {
    name: "Aryan (Test User)",
    email: "test@staysphere.com",
    password: "test1234",
  },
];

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    // ── Seed Hotels ──────────────────────────────
    for (const hotel of hotels) {
      await Hotel.updateOne(
        { name: hotel.name },
        { $set: hotel },
        { upsert: true }
      );
    }
    console.log(`✅ ${hotels.length} hotels seeded successfully!`);

    // ── Seed Test Users ───────────────────────────
    for (const u of testUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ name: u.name, email: u.email, password: hashed });
        console.log(`✅ Test user created: ${u.email} (password: ${u.password})`);
      } else {
        console.log(`ℹ️  User already exists: ${u.email} — skipped`);
      }
    }

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedAll();
