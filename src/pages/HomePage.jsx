"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Ballpit from "../components/Ballpit/Ballpit";
import Navbar from "../components/Navbar/Navbar";
import IntroHotel from "../components/IntroHotel/IntroHotel";
import Masonry from "../components/Masonry/Masonry"; 
import RoomsSlider from "../components/RoomsSlider/RoomsSlider"; 
import "./HomePage.css";

const HomePage = () => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const newOpacity = Math.max(1 - window.scrollY / 300, 0);
      setOpacity(newOpacity);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Ballpit background */}
      <div className="ballpit-background" style={{ opacity }}>
        <Ballpit
          count={100}
          gravity={0.5}
          friction={0.9975}
          wallBounce={0.8}
          followCursor={true}
        />
      </div>

      {/* Navbar */}
      <header className="home-header">
        <Navbar />
      </header>

      {/* Intro Section – IntroHotel sẽ xuất hiện sau 100vh nhờ padding-top trên container */}
      <section className="home-intro">
        <IntroHotel />
      </section>

      {/* Masonry Section */}
      <motion.section
        className="more-content"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.0, ease: "easeOut", staggerChildren: 0.2 }}
        viewport={{ once: true }}
      >
        <motion.h3>Discover More</motion.h3>
        <motion.p>
          Here you'll find more details about our services, facilities, and booking options.
        </motion.p>
        <motion.div>
          <Masonry />
        </motion.div>
      </motion.section>

      {/* Rooms Slider */}
      <RoomsSlider />
    </div>
  );
};

export default HomePage;
