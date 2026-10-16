require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");

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
    image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=900&q=80",
    packages: ["Breakfast", "Desert Safari"],
  },
];

async function seedHotels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Update existing demo records or insert new ones.
    for (const hotel of hotels) {
      await Hotel.updateOne(
        { name: hotel.name },
        { $set: hotel },
        { upsert: true }
      );
    }

    console.log("Demo hotels seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedHotels();