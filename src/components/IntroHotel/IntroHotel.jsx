import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import imgbg1 from "../../assets/images/imgbg1.jpg";
import imgbg2 from "../../assets/images/imgbg2.jpg";
import imgbg3 from "../../assets/images/imgbg3.jpg";
import imgbg4 from "../../assets/images/imgbg4.jpg";
import imgbg5 from "../../assets/images/imgbg5.jpg";
import imgbg6 from "../../assets/images/imgbg6.jpg";
import imgbg7 from "../../assets/images/imgbg7.jpg";
import imgbg8 from "../../assets/images/imgbg8.jpg";
import imgbg9 from "../../assets/images/imgbg9.jpg";
import "./IntroHotel.css";

const images = [
  { id: 1, src: imgbg1 },
  { id: 2, src: imgbg2 },
  { id: 3, src: imgbg3 },
  { id: 4, src: imgbg4 },
  { id: 5, src: imgbg5 },
  { id: 6, src: imgbg6 },
  { id: 7, src: imgbg7 },
  { id: 8, src: imgbg8 },
  { id: 9, src: imgbg9 },
];

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const generateGrid = () => {
  return shuffle([...images]).map((img) => (
    <motion.div
      key={img.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="grid-item"
      style={{ backgroundImage: `url(${img.src})` }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [gridItems, setGridItems] = useState(generateGrid());

  useEffect(() => {
    const shuffleGrid = () => {
      setGridItems(generateGrid());
      timeoutRef.current = setTimeout(shuffleGrid, 3000);
    };

    shuffleGrid();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="grid-container">
      {gridItems}
    </div>
  );
};

const IntroHotel = () => {
  return (
    <section className="intro-hotel-section">
      <div className="intro-text">
        <span className="intro-tagline">Experience Luxury</span>
        <h1 className="intro-title">Welcome to Grand Royale Hotel</h1>
        <p className="intro-description">
          Grand Royale Hotel offers an unparalleled experience where luxury meets comfort.
          Nestled in the heart of the city, our hotel boasts world-class amenities, exquisite dining,
          and exceptional service – ensuring that every stay is a memorable escape.
          Discover the perfect blend of modern sophistication and timeless elegance.
        </p>
      </div>
      <ShuffleGrid />
    </section>
  );
};

export default IntroHotel;
