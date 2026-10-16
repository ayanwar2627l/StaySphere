import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking" element={<Booking />} />
        

      </Routes>
    </BrowserRouter>

  );
}