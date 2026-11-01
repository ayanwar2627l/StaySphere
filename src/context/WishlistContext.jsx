import { createContext, useContext, useState, useEffect } from "react";
import { getUserWishlist, syncWishlistItem } from "../api";

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

  // Dynamic initial sync with backend database if signed in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("ss_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.email) {
          getUserWishlist(u.email).then((remoteList) => {
            if (Array.isArray(remoteList) && remoteList.length > 0) {
              setWishlist((current) => Array.from(new Set([...current, ...remoteList])));
            }
          });
        }
      }
    } catch {
      // Ignore
    }
  }, []);

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
      const action = exists ? "remove" : "add";

      // Dynamic sync with backend
      try {
        const storedUser = localStorage.getItem("ss_user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.email) {
            syncWishlistItem(u.email, hotelId, action);
          }
        }
      } catch {
        // Ignore
      }

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

