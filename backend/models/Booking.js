const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    hotelId: {
      type: String,
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "",
    },
    room: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    checkIn: {
      type: String,
      required: true,
    },
    checkOut: {
      type: String,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    extras: {
      type: [String],
      default: [],
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "UPI",
    },
    upiId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
