const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
