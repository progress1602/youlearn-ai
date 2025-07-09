import { jwtDecode } from "jwt-decode";
import { useCallback } from "react";

  // Function to extract username from JWT and save to localStorage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, react-hooks/rules-of-hooks
  const getUsernameFromToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      return storedUsername;
    }

    const token = localStorage.getItem("Token");
    if (!token) {
      console.warn("No JWT token found in localStorage under 'Token'");
      return null;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded.username) {
        console.warn("No 'username' field found in JWT payload");
        return null;
      }
      localStorage.setItem("username", decoded.username);
      return decoded.username;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }, [jwtDecode]);