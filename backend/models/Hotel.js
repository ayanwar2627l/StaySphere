const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, default: "" },
  },
  { timestamps: true }
);

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  extra: { type: Number, default: 0 },
  sqft: { type: String, default: "450 sq.ft" },
  bed: { type: String, default: "1 King Bed" },
  guests: { type: Number, default: 2 },
  desc: { type: String, default: "" },
});

const hotelSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    highlights: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    packages: {
      type: [String],
      default: [],
    },
    roomTypes: {
      type: [roomTypeSchema],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
