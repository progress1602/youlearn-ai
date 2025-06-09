"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "./components/LandingPage/Grid";
import HeroSection from "./components/LandingPage/HeroSection";
// import Marquee from "./components/LandingPage/Marquee";
// import Case from "./components/LandingPage/Case";
import Learn from "./components/LandingPage/Learn";
import Footer from "./components/LandingPage/Footer";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Checking token in Home component...");
    const token = localStorage.getItem("Token"); // Consistent with Auth component
    console.log("Token found:", token);

    if (token) {
      console.log("Token exists, setting isAuthenticated to true and redirecting to /app");
      setIsAuthenticated(true);
      router.replace("/app"); // Redirect to /app if token exists
    } else {
      console.log("No token found, setting isAuthenticated to false");
      setIsAuthenticated(false); // No token, stay on home page
    }

    console.log("Setting loading to false");
    setLoading(false);
  }, [router]);

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