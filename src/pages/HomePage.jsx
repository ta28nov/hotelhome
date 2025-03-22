"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Ballpit from "../components/Ballpit/Ballpit";
import Navbar from "../components/Navbar/Navbar";
import "./HomePage.css";

// Import hình ảnh từ src/assets/images
import imgbg1 from "../assets/images/imgbg1.jpg";
import imgbg2 from "../assets/images/imgbg2.jpg";
import imgbg3 from "../assets/images/imgbg3.jpg";
import imgbg4 from "../assets/images/imgbg4.jpg";
import imgbg5 from "../assets/images/imgbg5.jpg";
import imgbg6 from "../assets/images/imgbg6.jpg";
import imgbg7 from "../assets/images/imgbg7.jpg";
import imgbg8 from "../assets/images/imgbg8.jpg";
import imgbg9 from "../assets/images/imgbg9.jpg";
import imgbg10 from "../assets/images/imgbg10.jpg";

// Dữ liệu dùng chung cho RotatingImageText và Masonry
const dataItems = [
  { id: 1, image: imgbg1, text: "Experience unmatched luxury and elegance.", height: 400 },
  { id: 2, image: imgbg2, text: "Relax in a refined atmosphere of comfort.", height: 300 },
  { id: 3, image: imgbg3, text: "Our premium service is your priority.", height: 300 },
  { id: 4, image: imgbg4, text: "Discover exquisite dining and leisure.", height: 300 },
  { id: 5, image: imgbg5, text: "Indulge in our state-of-the-art facilities.", height: 300 },
  { id: 6, image: imgbg6, text: "Your comfort, our passion.", height: 300 },
  { id: 7, image: imgbg7, text: "A sanctuary of serenity awaits you.", height: 200 },
  { id: 8, image: imgbg8, text: "Immerse in the perfect blend of luxury and style.", height: 300 },
  { id: 9, image: imgbg9, text: "Where every detail is designed with you in mind.", height: 200 },
  { id: 10, image: imgbg10, text: "Welcome to a world of exclusive experiences.", height: 400 },
];

/* ============================================================
   COMPONENT RotatingImageText
   - Hiển thị tự động xoay qua các hình ảnh từ dataItems.
   ============================================================ */
const RotatingImageText = ({ data, interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, interval);
    return () => clearInterval(timer);
  }, [data.length, interval]);

  return (
    <div className="rotating-image-text">
      <AnimatePresence>
        <motion.div
          key={data[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="rotating-item"
          style={{ 
            backgroundImage: `url(${data[currentIndex].image})`,
            height: data[currentIndex].height 
          }}
        >
          <div className="rotating-overlay">
            <p>{data[currentIndex].text}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ============================================================
   COMPONENT FlippableGridItem
   - Dùng trong Masonry: giữ layout cũ (vị trí tính toán) và thêm hiệu ứng flip khi nhấn vào,
     kèm hiệu ứng hover và khoảng cách giữa các item.
   ============================================================ */
   const FlippableGridItem = ({ item, style }) => {
    const [flipped, setFlipped] = useState(false);
  
    return (
      <motion.div 
        className="masonry-item"
        style={{ ...style, perspective: 1200 }} // Giữ hiệu ứng 3D khi lật
        onClick={() => setFlipped(!flipped)}
        whileHover={!flipped ? { scale: 1.08, rotateY: 3 } : { scale: 1.05 }} 
      >
        <motion.div 
          className="masonry-item-inner"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }} // Giảm damping, tăng độ mượt
          style={{ 
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%"
          }}
        >
          {/* Front: hiển thị ảnh */}
          <motion.div
            className="flip-card-front"
            style={{
              backgroundImage: `url(${item.image})`,
              height: "100%",
              width: "100%",
              position: "absolute",
              backfaceVisibility: "hidden",
              backgroundColor: "white", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: flipped ? 0 : 1, // Hiệu ứng mượt khi lật
              transition: "opacity 0.3s ease-in-out",
            }}
          />
  
          {/* Back: hiển thị text */}
          <motion.div
            className="flip-card-back"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "white", // Giữ màu trắng
              color: "black", // Giữ màu chữ mặc định
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: flipped ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {item.text}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

 
  /* ============================================================
   COMPONENT Masonry
   - Sử dụng layout cũ (tính toán vị trí dựa trên số cột) và render FlippableGridItem.
   ============================================================ */
const Masonry = ({ data }) => {
  const [columns, setColumns] = useState(2);
  const containerRef = useRef();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateColumns = () => {
      if (window.matchMedia("(min-width: 1500px)").matches) {
        setColumns(5);
      } else if (window.matchMedia("(min-width: 1000px)").matches) {
        setColumns(4);
      } else if (window.matchMedia("(min-width: 600px)").matches) {
        setColumns(3);
      } else {
        setColumns(1);
      }
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [heights, gridItems] = useMemo(() => {
    let heights = new Array(columns).fill(0);
    let gridItems = data.map((child) => {
      const column = heights.indexOf(Math.min(...heights));
      const x = (width / columns) * column;
      const y = (heights[column] += child.height / 2) - child.height / 2;
      return { ...child, x, y, width: width / columns, height: child.height / 2 };
    });
    return [heights, gridItems];
  }, [columns, data, width]);

  return (
    <div ref={containerRef} className="masonry" style={{ height: Math.max(...heights), position: "relative" }}>
      {gridItems.map((item) => (
        <FlippableGridItem 
          key={item.id} 
          item={item} 
          style={{ 
            position: "absolute", 
            left: item.x, 
            top: item.y, 
            width: item.width, 
            height: item.height,
            padding: "5px" // Tăng khoảng cách giữa các item
          }}
        />
      ))}
    </div>
  );
};

/* ============================================================
   HOME PAGE COMPONENT
   - Bao gồm Ballpit background, Navbar, phần giới thiệu (RotatingImageText)
     và phần Masonry với hiệu ứng flip cho từng mục.
   - Phần nội dung bên dưới xuất hiện theo hiệu ứng scroll.
   ============================================================ */
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

      {/* Rotating image text */}
      <section className="home-content">
        <RotatingImageText data={dataItems} interval={3000} />
      </section>

      {/* Masonry section xuất hiện theo hiệu ứng scroll */}
      <motion.section
        className="more-content"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2>Discover More</h2>
        <p>
          Here you'll find more details about our services, facilities, and booking options.
        </p>
        <Masonry data={dataItems} />
      </motion.section>
    </div>
  );
};

export default HomePage;
