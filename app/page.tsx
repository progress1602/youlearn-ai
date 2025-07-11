"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Grid from "./components/LandingPage/Grid";
import HeroSection from "./components/LandingPage/HeroSection";
// import Marquee from "./components/LandingPage/Marquee";
// import Case from "./components/LandingPage/Case";
import Learn from "./components/LandingPage/Learn";
import Footer from "./components/LandingPage/Footer";

function AuthChecker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Checking token and auth parameter in Home component...");
    const token = localStorage.getItem("Token");
    const authParam = searchParams.get("auth");

    console.log("Token found:", token);
    console.log("Auth parameter found:", authParam);

    if (token && authParam !== null) {
      console.log("Redirecting to /app...");
      setIsAuthenticated(true);
      router.replace("/app");
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, [router, searchParams]);

  if (loading) {
    return null;
  }

  return (
    <>
      {!isAuthenticated && (
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthChecker />
    </Suspense>
  );
}
