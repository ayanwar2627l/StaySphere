import axios from "axios";
import fallbackHotels from "./data/hotels";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 3500, // Quick timeout so UI doesn't hang if backend is down
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ss_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If server returns 401, clear stale auth and let the UI handle it
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ss_token");
      localStorage.removeItem("ss_user");
    }
    return Promise.reject(err);
  }
);

// Helper: Merge backend hotel data with rich client details (images, amenities, rooms, reviews)
function mergeHotelDetails(hotel) {
  const matchingFallback = fallbackHotels.find(
    (f) =>
      String(f._id) === String(hotel._id) ||
      String(f.id) === String(hotel.id) ||
      f.name.toLowerCase().includes(hotel.name.toLowerCase().slice(0, 10))
  );

  if (!matchingFallback) return hotel;

  return {
    ...matchingFallback,
    ...hotel,
    images: hotel.images?.length ? hotel.images : matchingFallback.images,
    amenities: hotel.amenities?.length ? hotel.amenities : matchingFallback.amenities,
    highlights: hotel.highlights?.length ? hotel.highlights : matchingFallback.highlights,
    roomTypes: hotel.roomTypes?.length ? hotel.roomTypes : matchingFallback.roomTypes,
    reviews: hotel.reviews?.length ? hotel.reviews : matchingFallback.reviews,
    description: hotel.description || matchingFallback.description,
    tagline: hotel.tagline || matchingFallback.tagline,
    originalPrice: hotel.originalPrice || matchingFallback.originalPrice,
    reviewsCount: hotel.reviewsCount || matchingFallback.reviewsCount,
    badge: hotel.badge || matchingFallback.badge,
  };
}

// Fetch all hotels with dynamic search, filter, and sort
export async function getHotels(params = {}) {
  try {
    const res = await api.get("/hotels", { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mergeHotelDetails);
    }
  } catch (err) {
    console.warn("Backend /hotels query failed, applying dynamic filter on local dataset:", err.message);
  }

  // Dynamic client-side fallback filtering & sorting if backend query fails
  let list = fallbackHotels;
  if (params.category && params.category !== "all") {
    list = list.filter((h) => h.category?.toLowerCase() === params.category.toLowerCase());
  }
  if (params.location && params.location !== "All India") {
    const loc = params.location.toLowerCase();
    list = list.filter((h) =>
      h.location?.toLowerCase().includes(loc) ||
      h.city?.toLowerCase().includes(loc) ||
      h.state?.toLowerCase().includes(loc)
    );
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.description?.toLowerCase().includes(q) ||
      h.category?.toLowerCase().includes(q)
    );
  }
  if (params.minPrice) list = list.filter((h) => h.price >= Number(params.minPrice));
  if (params.maxPrice) list = list.filter((h) => h.price <= Number(params.maxPrice));
  if (params.rating) list = list.filter((h) => h.rating >= Number(params.rating));

  if (params.sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (params.sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (params.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  else if (params.sort === "popular") list = [...list].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));

  return list;
}

// Fetch single hotel by ID with fallback
export async function getHotelById(id) {
  try {
    const res = await api.get(`/hotels/${id}`);
    if (res.data) {
      return mergeHotelDetails(res.data);
    }
  } catch (err) {
    console.warn(`Backend /hotels/${id} unavailable, checking local dataset:`, err.message);
  }

  const found = fallbackHotels.find(
    (h) => String(h._id) === String(id) || String(h.id) === String(id)
  );
  return found || fallbackHotels[0];
}

// Submit a dynamic review for a hotel
export async function submitReview(hotelId, reviewData) {
  try {
    const res = await api.post(`/hotels/${hotelId}/reviews`, reviewData);
    if (res.data?.hotel) {
      return mergeHotelDetails(res.data.hotel);
    }
  } catch (err) {
    console.warn("Backend /reviews post failed, adding review dynamically to local memory:", err.message);
  }

  // Local fallback: append to mock review list
  const fallbackHotel = fallbackHotels.find(
    (h) => String(h._id) === String(hotelId) || String(h.id) === String(hotelId)
  );
  if (fallbackHotel) {
    if (!fallbackHotel.reviews) fallbackHotel.reviews = [];
    fallbackHotel.reviews.unshift({
      userName: reviewData.userName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    });
    fallbackHotel.reviewsCount = (fallbackHotel.reviewsCount || 0) + 1;
    return { ...fallbackHotel };
  }
  return null;
}

// Dynamic Wishlist Sync
export async function getUserWishlist(email) {
  if (!email) return [];
  try {
    const res = await api.get(`/users/wishlist?email=${encodeURIComponent(email)}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function syncWishlistItem(email, hotelId, action) {
  if (!email || !hotelId) return;
  try {
    await api.post("/users/wishlist", { email, hotelId, action });
  } catch {
    // Fail silently in background
  }
}

// Booking storage helpers
export function getLocalBookings() {
  try {
    const raw = localStorage.getItem("ss_bookings");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalBooking(booking) {
  try {
    const existing = getLocalBookings();
    const updated = [booking, ...existing.filter((b) => b._id !== booking._id)];
    localStorage.setItem("ss_bookings", JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save booking locally", e);
    return [];
  }
}

// Submit a new booking (requires signed in verified user)
export async function submitBooking(bookingData) {
  if (
    !bookingData.userEmail ||
    bookingData.userEmail === "guest@staysphere.com" ||
    !bookingData.userEmail.includes("@")
  ) {
    throw new Error("Authentication required. Please sign in with a verified account to complete your booking.");
  }

  const clientBookingId = "BK-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const enhancedData = {
    ...bookingData,
    _id: clientBookingId,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await api.post("/bookings", bookingData);
    if (res.data) {
      const serverBooking = {
        ...res.data,
        status: res.data.status || "Confirmed",
      };
      saveLocalBooking(serverBooking);
      return serverBooking;
    }
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error(err.response?.data?.message || "Authentication required. Please sign in to book.");
    }
    console.warn("Backend /bookings call failed, saving booking to local store:", err.message);
  }

  saveLocalBooking(enhancedData);
  return enhancedData;
}

// Cancel booking
export async function cancelBooking(bookingId) {
  try {
    await api.patch(`/bookings/${bookingId}/cancel`);
  } catch {
    // If backend is not reached, update locally
  }

  const existing = getLocalBookings();
  const updated = existing.map((b) =>
    b._id === bookingId ? { ...b, status: "Cancelled" } : b
  );
  localStorage.setItem("ss_bookings", JSON.stringify(updated));
  return updated;
}

// ── Verified User Accounts Store ──────────────────────────────
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem("ss_registered_users");
    if (!raw) {
      // Default initial verified account
      const defaults = [
        {
          name: "Aryan",
          email: "test@staysphere.com",
          password: "test1234",
          isVerified: true,
        },
      ];
      localStorage.setItem("ss_registered_users", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function registerVerifiedUser({ name, email, password }) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    throw new Error("An account with this email already exists. Please sign in.");
  }

  const newUser = {
    name,
    email: normalizedEmail,
    password,
    isVerified: true,
    registeredAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("ss_registered_users", JSON.stringify(users));

  // Also sync new registered account to MongoDB database
  api.post("/auth/register", { name, email: normalizedEmail, password }).catch(() => {});

  return newUser;
}

export function saveRegisteredUserLocally(user) {
  try {
    const users = getRegisteredUsers();
    const normalizedEmail = user.email.toLowerCase().trim();
    if (!users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      users.push({
        name: user.name,
        email: normalizedEmail,
        isVerified: true,
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem("ss_registered_users", JSON.stringify(users));
    }
  } catch {
    // Ignore
  }
}

export function verifyUserLogin(email, password) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error("No verified account found with this email. Please create an account first.");
  }

  if (user.password !== password) {
    throw new Error("Incorrect password. Please verify your credentials and try again.");
  }

  return {
    name: user.name,
    email: user.email,
    token: "verified_jwt_" + Math.random().toString(36).substring(2, 12),
    isVerified: true,
  };
}

export default api;
