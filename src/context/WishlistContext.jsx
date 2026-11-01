import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("ss_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ss_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist]);

  function isFavorite(hotelId) {
    if (!hotelId) return false;
    return wishlist.some((id) => String(id) === String(hotelId));
  }

  function toggleFavorite(hotelId) {
    if (!hotelId) return false;
    let added = false;
    setWishlist((prev) => {
      const exists = prev.some((id) => String(id) === String(hotelId));
      if (exists) {
        return prev.filter((id) => String(id) !== String(hotelId));
      } else {
        added = true;
        return [...prev, String(hotelId)];
      }
    });
    return added;
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleFavorite, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

