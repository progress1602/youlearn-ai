"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "./components/LandingPage/Grid";
import HeroSection from "./components/LandingPage/HeroSection";
import Marquee from "./components/LandingPage/Marquee";
import Case from "./components/LandingPage/Case";
import Learn from "./components/LandingPage/Learn";
import Footer from "./components/LandingPage/Footer";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push("/auth");
    }

    setLoading(false);
  }, [router]);

  if (loading) return null;

  return (
    <>
      {isAuthenticated ? (
        <div>
          <HeroSection />
          <Marquee />
          <Grid />
          <Case />
          <Learn />
          <Footer />
        </div>
      ) : null}
    </>
  );
}