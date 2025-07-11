"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Grid from "./components/LandingPage/Grid";
import HeroSection from "./components/LandingPage/HeroSection";
// import Marquee from "./components/LandingPage/Marquee";
// import Case from "./components/LandingPage/Case";
import Learn from "./components/LandingPage/Learn";
import Footer from "./components/LandingPage/Footer";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Checking token and auth parameter in Home component...");
    const token = localStorage.getItem("Token"); // Consistent with Auth component
    const authParam = searchParams.get("auth"); // Get auth parameter from URL
    console.log("Token found:", token);
    console.log("Auth parameter found:", authParam);

    // Check if token exists and auth parameter is present (regardless of value)
    if (token && authParam !== null) {
      console.log("Token and auth parameter exist, setting isAuthenticated to true and redirecting to /app");
      setIsAuthenticated(true);
      router.replace("/app"); // Redirect to /app if both conditions are met
    } else {
      console.log("Missing token or auth parameter, setting isAuthenticated to false");
      setIsAuthenticated(false); // Stay on home page if either condition fails
    }

    console.log("Setting loading to false");
    setLoading(false);
  }, [router, searchParams]);

  if (loading) {
    console.log("Loading state is true, rendering null");
    return null;
  }

  console.log("Rendering Home component, isAuthenticated:", isAuthenticated);

  return (
    <>
      {isAuthenticated ? null : (
        <div>
          <HeroSection />
          {/* <Marquee /> */}
          <Grid />
          {/* <Case /> */}
          <Learn />
          <Footer />
        </div>
      )}
    </>
  );
}